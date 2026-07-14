"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CloudUpload, Plus, X, ChevronLeft, ChevronRight, Search, Trash2 } from "lucide-react";
import { useCategories } from "@/hooks/queries/useCategories";
import { useProducts } from "@/hooks/queries/useProducts";
import { useCreateOffer } from "@/hooks/mutations/useCreateOffer";
import { useUpdateOffer } from "@/hooks/mutations/useUpdateOffer";
import { ProductItem, ProductVariantEntry } from "@/types/product.types";
import { OfferItem } from "@/types/offer.types";

interface LocalProductEntry {
  productId: string;
  productName: string;
  variantItemIds: string[];
}

interface OfferItemState {
  categoryId: string;
  categoryName: string;
  isFixed: boolean;
  products: LocalProductEntry[];
}

// Safely extract _id from populated objects or plain strings
function extractId(val: unknown): string {
  if (val && typeof val === "object" && "_id" in val) return (val as { _id: string })._id;
  return String(val ?? "");
}

function extractName(val: unknown): string {
  if (val && typeof val === "object" && "name" in val) return (val as { name: string }).name;
  return "";
}

function getVariantId(v: ProductVariantEntry): string {
  return typeof v.variantItemId === "string" ? v.variantItemId : v.variantItemId._id;
}

function getVariantName(v: ProductVariantEntry): string {
  return typeof v.variantItemId === "string" ? v.variantItemId : v.variantItemId.name;
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative w-10 h-5 rounded-full transition-colors ${value ? "bg-white" : "bg-white/20"}`}
    >
      <span className={`absolute top-0.5 w-4 h-4 rounded-full shadow transition-all ${value ? "left-5 bg-black" : "left-0.5 bg-white"}`} />
    </button>
  );
}

function OfferProductsModal({ existing, onClose, onSave }: {
  existing?: OfferItemState;
  onClose: () => void;
  onSave: (item: OfferItemState) => void;
}) {
  const [step, setStep] = useState<"categories" | "products">(existing ? "products" : "categories");
  const [catId, setCatId] = useState(existing?.categoryId ?? "");
  const [catName, setCatName] = useState(existing?.categoryName ?? "");
  const [isFixed] = useState(existing?.isFixed ?? false);
  const [productSearch, setProductSearch] = useState("");

  const [selectedVariantIds, setSelectedVariantIds] = useState<Set<string>>(() => {
    const ids = new Set<string>();
    existing?.products.forEach((p) => p.variantItemIds.forEach((id) => ids.add(id)));
    return ids;
  });

  const [productVariantOverrides, setProductVariantOverrides] = useState<Map<string, Set<string>>>(() => {
    if (!existing) return new Map();
    const globalIds = new Set<string>();
    existing.products.forEach((p) => p.variantItemIds.forEach((id) => globalIds.add(id)));
    const overrides = new Map<string, Set<string>>();
    existing.products.forEach((p) => {
      const deselected = new Set<string>();
      globalIds.forEach((id) => { if (!p.variantItemIds.includes(id)) deselected.add(id); });
      if (deselected.size > 0) overrides.set(p.productId, deselected);
    });
    return overrides;
  });

  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(
    new Set(existing?.products.map((p) => p.productId) ?? [])
  );

  const { data: catData } = useCategories({});
  const categories = catData?.result ?? [];

  const { data: productData, isLoading: productsLoading } = useProducts(
    catId ? { categoryId: catId, limit: 100 } : {},
    { enabled: !!catId }
  );
  const products: ProductItem[] = productData?.result ?? [];
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const allVariants = products.reduce<{ id: string; name: string }[]>((acc, p) => {
    p.variants.forEach((v) => {
      const id = getVariantId(v);
      if (!acc.find((x) => x.id === id)) acc.push({ id, name: getVariantName(v) });
    });
    return acc;
  }, []);

  const allVariantsSelected = allVariants.length > 0 && allVariants.every((v) => selectedVariantIds.has(v.id));
  const allProductsSelected = filteredProducts.length > 0 && filteredProducts.every((p) => selectedProductIds.has(p._id));

  const toggleVariant = (id: string) =>
    setSelectedVariantIds((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const toggleProductVariant = (productId: string, variantId: string) =>
    setProductVariantOverrides((prev) => {
      const n = new Map(prev);
      const cur = new Set(n.get(productId) ?? []);
      cur.has(variantId) ? cur.delete(variantId) : cur.add(variantId);
      n.set(productId, cur);
      return n;
    });

  const toggleProduct = (id: string) =>
    setSelectedProductIds((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const handleSave = () => {
    const productsList: LocalProductEntry[] = Array.from(selectedProductIds).map((productId) => {
      const product = products.find((p) => p._id === productId);
      const productVariantIds = (product?.variants ?? []).map((v) => getVariantId(v));
      const overrides = productVariantOverrides.get(productId) ?? new Set<string>();
      const appliedVariantIds = productVariantIds.filter((id) => selectedVariantIds.has(id) && !overrides.has(id));
      return { productId, productName: product?.name ?? "", variantItemIds: appliedVariantIds };
    });
    onSave({ categoryId: catId, categoryName: catName, isFixed, products: productsList });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-[#1a1a1a] rounded-2xl w-full max-w-130 mx-4 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            {step === "products" && !existing && (
              <button type="button" onClick={() => setStep("categories")} className="p-1 text-white/40 hover:text-white transition-colors">
                <ChevronLeft size={18} />
              </button>
            )}
            <h2 className="text-lg font-semibold text-white">Offer Products</h2>
          </div>
          <button type="button" onClick={onClose} className="text-red-400 hover:text-red-300 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {step === "categories" ? (
            <>
              <p className="text-sm font-medium text-white mb-0.5">Product Category</p>
              <p className="text-xs text-white/40 mb-4">You can add multiple category into this offer.</p>
              <div className="space-y-2">
                {categories.length === 0 ? (
                  <p className="text-sm text-white/40 text-center py-8">No categories available.</p>
                ) : categories.map((cat) => (
                  <button
                    key={cat._id}
                    type="button"
                    onClick={() => {
                      setCatId(cat._id); setCatName(cat.name);
                      setSelectedVariantIds(new Set()); setSelectedProductIds(new Set());
                      setProductVariantOverrides(new Map()); setProductSearch("");
                      setStep("products");
                    }}
                    className="flex items-center justify-between w-full px-4 py-3 rounded-xl border border-white/10 hover:border-white/20 transition-colors"
                  >
                    <span className="text-sm text-white">{cat.name}</span>
                    <div className="flex items-center gap-2 text-white/40">
                      <span className="text-xs">{cat.totalProducts ?? 0}</span>
                      <ChevronRight size={14} />
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-5">
              {!productsLoading && allVariants.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <p className="text-sm font-medium text-white"><span className="text-red-400">*</span> Choose Product Variant</p>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox" checked={allVariantsSelected}
                        onChange={() => allVariantsSelected ? setSelectedVariantIds(new Set()) : setSelectedVariantIds(new Set(allVariants.map((v) => v.id)))}
                        className="w-4 h-4 rounded accent-white"
                      />
                      <span className="text-xs text-white/50">Select all</span>
                    </label>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {allVariants.map((v) => {
                      const selected = selectedVariantIds.has(v.id);
                      return (
                        <label key={v.id} className={`flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer transition-colors ${selected ? "border-white/40 bg-white/10 text-white" : "border-white/15 text-white/50 hover:border-white/25"}`}>
                          <input type="checkbox" checked={selected} onChange={() => toggleVariant(v.id)} className="w-4 h-4 rounded accent-white" />
                          <span className="text-sm">{v.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <p className="text-sm font-medium text-white">Choose product</p>
                    <p className="text-xs text-white/40 mt-0.5">You can add multiple products into this offer.</p>
                  </div>
                  <label className="flex items-center gap-1.5 cursor-pointer self-start">
                    <input
                      type="checkbox" checked={allProductsSelected}
                      onChange={() => allProductsSelected ? setSelectedProductIds(new Set()) : setSelectedProductIds(new Set(filteredProducts.map((p) => p._id)))}
                      className="w-4 h-4 rounded accent-white"
                    />
                    <span className="text-xs text-white/50">Select all</span>
                  </label>
                </div>

                <div className="flex items-center gap-2 border border-white/10 rounded-xl px-4 py-2.5 mt-3 mb-3 focus-within:border-white transition-colors">
                  <Search size={14} className="text-white/30 shrink-0" />
                  <input value={productSearch} onChange={(e) => setProductSearch(e.target.value)} placeholder="Search product name to add" className="bg-transparent text-sm text-white placeholder-white/30 outline-none w-full" />
                </div>

                {productsLoading ? (
                  <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}</div>
                ) : filteredProducts.length === 0 ? (
                  <p className="text-sm text-white/40 text-center py-8">No products found.</p>
                ) : (
                  <div className="space-y-3">
                    {filteredProducts.map((product) => {
                      const isSelected = selectedProductIds.has(product._id);
                      const productVariants = product.variants.reduce<{ id: string; name: string; price: number }[]>((acc, v) => {
                        const id = getVariantId(v);
                        if (!acc.find((x) => x.id === id)) acc.push({ id, name: getVariantName(v), price: v.price });
                        return acc;
                      }, []);
                      const displayVariants = selectedVariantIds.size > 0 ? productVariants.filter((v) => selectedVariantIds.has(v.id)) : productVariants;
                      const productOverrides = productVariantOverrides.get(product._id) ?? new Set<string>();

                      return (
                        <div
                          key={product._id}
                          onClick={() => toggleProduct(product._id)}
                          className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${isSelected ? "border-white/25 bg-white/4" : "border-white/10 hover:border-white/18"}`}
                        >
                          {product.mainImage ? (
                            <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 relative">
                              <Image src={product.mainImage} alt={product.name} fill className="object-cover" unoptimized />
                            </div>
                          ) : (
                            <div className="w-14 h-14 rounded-xl bg-white/8 shrink-0 flex items-center justify-center text-white/30 text-sm font-medium">{product.name[0]}</div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white font-medium">{product.name}</p>
                            {product.description && <p className="text-xs text-white/40 truncate">{product.description}</p>}
                            {product.type === "variant" && displayVariants.length > 0 && (
                              <div className="mt-1.5">
                                <p className="text-xs text-white/40 mb-1">Choose Variant</p>
                                <div className="flex gap-1.5 flex-wrap">
                                  {displayVariants.map((v) => {
                                    const deselected = productOverrides.has(v.id);
                                    return (
                                      <button
                                        key={v.id}
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); toggleProductVariant(product._id, v.id); }}
                                        className={`px-2.5 py-1 rounded-lg border text-xs transition-colors ${deselected ? "border-white/8 text-white/25 line-through" : "border-white/20 text-white/70 hover:border-red-400/40 hover:text-red-400/80"}`}
                                      >
                                        {v.name} {v.price.toLocaleString()} kr.
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                            {product.type === "single" && product.price !== undefined && (
                              <p className="text-xs text-white/50 mt-1">{product.price.toLocaleString()} kr.</p>
                            )}
                          </div>
                          <input type="checkbox" checked={isSelected} onChange={() => toggleProduct(product._id)} onClick={(e) => e.stopPropagation()} className="w-4 h-4 rounded accent-white mt-0.5 shrink-0 cursor-pointer" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 pb-6 pt-4 border-t border-white/10 shrink-0">
          <div className="flex gap-3">
            {step === "categories" || existing ? (
              <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/15 text-white text-sm font-medium hover:bg-white/5 transition-colors">Cancel</button>
            ) : (
              <button type="button" onClick={() => setStep("categories")} className="flex-1 py-3 rounded-xl border border-white/15 text-white text-sm font-medium hover:bg-white/5 transition-colors">Back</button>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={step === "categories" || selectedProductIds.size === 0}
              className="flex-1 py-3 rounded-xl bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Save Products
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OfferForm({ initialData, offerId }: { initialData?: OfferItem; offerId?: string }) {
  const isEdit = !!(offerId && initialData);
  const router = useRouter();
  const { mutate: createOffer, isPending: isCreating } = useCreateOffer();
  const { mutate: updateOffer, isPending: isUpdating } = useUpdateOffer();
  const isPending = isCreating || isUpdating;

  const { data: catData } = useCategories({});

  // Form fields — pre-filled from initialData
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [price, setPrice] = useState(initialData ? String(initialData.price) : "");

  // Offer items — extract IDs from possibly-populated API fields
  const [offerItems, setOfferItems] = useState<OfferItemState[]>(() => {
    if (!initialData) return [];
    return initialData.offerItems.map((item) => ({
      categoryId: extractId(item.categoryId),
      categoryName: extractName(item.categoryId),
      isFixed: item.isFixed,
      products: item.products.map((p) => ({
        productId: extractId(p.productId),
        productName: "",
        variantItemIds: p.variantItemIds.map((v) => extractId(v)),
      })),
    }));
  });

  // Fill category names from catMap once it loads (for string categoryId cases)
  useEffect(() => {
    if (!catData) return;
    const catMap = new Map(catData.result.map((c) => [c._id, c.name]));
    setOfferItems((prev) =>
      prev.map((item) => ({
        ...item,
        categoryName: item.categoryName || catMap.get(item.categoryId) || item.categoryId,
      }))
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catData]);

  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [homeDelivery, setHomeDelivery] = useState(initialData?.availableFor.homeDelivery ?? true);
  const [takeaway, setTakeaway] = useState(initialData?.availableFor.takeaway ?? false);
  const [websiteAvail, setWebsiteAvail] = useState(initialData?.availability.website ?? true);
  const [posAvail, setPosAvail] = useState(initialData?.availability.pos ?? false);
  const [kioskAvail, setKioskAvail] = useState(initialData?.availability.kiosk ?? false);

  // Images
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  // mainImageBlobUrl: preview for newly selected file only
  const [mainImageBlobUrl, setMainImageBlobUrl] = useState<string | null>(null);
  // derived: show new blob if picked, otherwise existing backend URL
  const mainImagePreview = mainImageBlobUrl ?? initialData?.mainImage ?? null;
  // valid if a new file is selected OR an existing URL exists from the API
  const hasMainImage = !!(mainImageFile || initialData?.mainImage);

  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryFilePreviews, setGalleryFilePreviews] = useState<string[]>([]);
  const [existingGalleryUrls, setExistingGalleryUrls] = useState<string[]>(initialData?.gallery ?? []);
  const [removedGalleryUrls, setRemovedGalleryUrls] = useState<string[]>([]);

  const mainImageRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const handleMainImage = (file: File) => {
    setMainImageFile(file);
    setMainImageBlobUrl(URL.createObjectURL(file));
  };

  // Only called to undo a newly selected file — restores the existing API image
  const clearMainImage = () => {
    setMainImageFile(null);
    setMainImageBlobUrl(null);
    if (mainImageRef.current) mainImageRef.current.value = "";
  };

  const handleGallery = (files: FileList) => {
    setGalleryFiles((prev) => {
      const remaining = 5 - existingGalleryUrls.length - prev.length;
      if (remaining <= 0) return prev;
      const arr = Array.from(files).slice(0, remaining);
      setGalleryFilePreviews((pp) => [...pp, ...arr.map((f) => URL.createObjectURL(f))]);
      return [...prev, ...arr];
    });
  };

  const removeExistingGallery = (i: number) => {
    const url = existingGalleryUrls[i];
    setExistingGalleryUrls((p) => p.filter((_, idx) => idx !== i));
    setRemovedGalleryUrls((p) => [...p, url]);
  };
  const removeNewGallery = (i: number) => {
    setGalleryFiles((p) => p.filter((_, idx) => idx !== i));
    setGalleryFilePreviews((p) => p.filter((_, idx) => idx !== i));
  };

  const totalGallery = existingGalleryUrls.length + galleryFiles.length;
  const isValid = title.trim() && Number(price) > 0 && offerItems.length > 0 && (isEdit ? hasMainImage : !!mainImageFile);

  const handleModalSave = (item: OfferItemState) => {
    if (editingIdx !== null) {
      setOfferItems((prev) => prev.map((x, i) => (i === editingIdx ? item : x)));
    } else {
      setOfferItems((prev) => [...prev, item]);
    }
    setShowModal(false);
    setEditingIdx(null);
  };

  const buildOfferItemsPayload = () =>
    offerItems.map((item) => ({
      categoryId: item.categoryId,
      isFixed: item.isFixed,
      products: item.products.map((p) => ({
        productId: p.productId,
        variantItemIds: p.variantItemIds,
      })),
    }));

  const handleSubmit = () => {
    if (!isValid) return;
    const common = {
      title: title.trim(),
      description: description.trim() || undefined,
      price: Number(price),
      offerItems: buildOfferItemsPayload(),
      availability: { website: websiteAvail, pos: posAvail, kiosk: kioskAvail },
      availableFor: { homeDelivery, takeaway },
    };
    if (isEdit) {
      updateOffer(
        {
          id: offerId!,
          payload: {
            ...common,
            ...(mainImageFile ? { mainImage: mainImageFile } : {}),
            ...(galleryFiles.length > 0 ? { gallery: galleryFiles } : {}),
            ...(removedGalleryUrls.length > 0 ? { removeGallery: removedGalleryUrls } : {}),
          },
        },
        { onSuccess: () => router.push("/promotions/special-offer") }
      );
    } else {
      if (!mainImageFile) return;
      createOffer(
        { ...common, mainImage: mainImageFile, gallery: galleryFiles.length > 0 ? galleryFiles : undefined },
        { onSuccess: () => router.push("/promotions/special-offer") }
      );
    }
  };

  return (
    <div className="flex gap-6">
      {/* Left */}
      <div className="flex-1 space-y-5">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-white"><span className="text-red-400">*</span> Offer Title</label>
          <input
            type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter offer title"
            className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-white transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-white">Offer Description</label>
          <textarea
            value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="Write offer description" rows={4}
            className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-white transition-colors resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-white"><span className="text-red-400">*</span> Price (Kr.)</label>
          <input
            type="number" value={price} onChange={(e) => setPrice(e.target.value)}
            placeholder="Enter offer price" min={0}
            className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-white transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>

        {/* Offer Items */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white"><span className="text-red-400">*</span> Offer Products</label>
          {offerItems.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <p className="text-xs text-white/40">Item {idx + 1}</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setEditingIdx(idx); setShowModal(true); }}
                  className="flex-1 flex items-center justify-between bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-sm hover:border-white/20 transition-colors"
                >
                  <span className="text-white text-left">
                    <span className="font-medium">{item.categoryName || item.categoryId}</span>
                    <span className="text-white/50 ml-2">— {item.products.length} product{item.products.length !== 1 ? "s" : ""}</span>
                  </span>
                  <ChevronRight size={14} className="text-white/40 shrink-0 ml-2" />
                </button>
                <button
                  type="button"
                  onClick={() => setOfferItems((p) => p.filter((_, i) => i !== idx))}
                  className="p-3 text-red-400/60 hover:text-red-400 hover:bg-red-400/8 rounded-xl transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => { setEditingIdx(null); setShowModal(true); }}
            className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors mt-1"
          >
            <Plus size={15} /> Add Offer Item
          </button>
        </div>

        {/* Available For */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white"><span className="text-red-400">*</span> Offer Available For</label>
          <div className="grid grid-cols-2 gap-3">
            <label className={`flex items-center justify-between px-4 py-3.5 rounded-xl border cursor-pointer transition-colors ${homeDelivery ? "border-white/30 bg-white/4" : "border-white/10 hover:border-white/20"}`}>
              <span className="text-sm text-white">Home Delivery</span>
              <input type="checkbox" checked={homeDelivery} onChange={(e) => setHomeDelivery(e.target.checked)} className="w-4 h-4 rounded accent-white" />
            </label>
            <label className={`flex items-center justify-between px-4 py-3.5 rounded-xl border cursor-pointer transition-colors ${takeaway ? "border-white/30 bg-white/4" : "border-white/10 hover:border-white/20"}`}>
              <span className="text-sm text-white">Take Away</span>
              <input type="checkbox" checked={takeaway} onChange={(e) => setTakeaway(e.target.checked)} className="w-4 h-4 rounded accent-white" />
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isValid || isPending}
            className="px-10 py-3 bg-white text-black text-sm font-medium rounded-xl hover:bg-white/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isPending ? "Saving..." : isEdit ? "Update Offer" : "Save Offer"}
          </button>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-65 shrink-0 space-y-5">
        {/* Main Image */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-white"><span className="text-red-400">*</span> Main Image</label>
          <div className="relative bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden">
            {mainImagePreview ? (
              <>
                <div onClick={() => mainImageRef.current?.click()} className="relative w-full aspect-square cursor-pointer">
                  <Image src={mainImagePreview} alt="Main image" fill className="object-cover" unoptimized />
                </div>
                {mainImageFile && (
                  <button
                    type="button"
                    onClick={clearMainImage}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors z-10"
                  >
                    <X size={13} />
                  </button>
                )}
              </>
            ) : (
              <div onClick={() => mainImageRef.current?.click()} className="p-6 text-center cursor-pointer hover:border-white/20 transition-colors">
                <CloudUpload size={28} className="mx-auto text-white/30 mb-2" />
                <p className="text-sm text-white/40">Upload an image</p>
                <p className="text-xs text-white/25 mt-1">Webp, JPEG, PNG · 220×220 px</p>
              </div>
            )}
          </div>
          <input ref={mainImageRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleMainImage(f); }} />
        </div>

        {/* Gallery */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-white">Image Gallery</label>
          {totalGallery > 0 ? (
            <div className="grid grid-cols-3 gap-1.5">
              {existingGalleryUrls.map((src, i) => (
                <div key={`ex-${i}`} className="relative aspect-square rounded-lg overflow-hidden bg-white/5 group">
                  <Image src={src} alt={`Gallery ${i + 1}`} fill className="object-cover" unoptimized />
                  <button type="button" onClick={() => removeExistingGallery(i)} className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                    <X size={14} className="text-white" />
                  </button>
                </div>
              ))}
              {galleryFilePreviews.map((src, i) => (
                <div key={`new-${i}`} className="relative aspect-square rounded-lg overflow-hidden bg-white/5 group">
                  <Image src={src} alt={`Gallery new ${i + 1}`} fill className="object-cover" />
                  <button type="button" onClick={() => removeNewGallery(i)} className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                    <X size={14} className="text-white" />
                  </button>
                </div>
              ))}
              {totalGallery < 5 && (
                <div onClick={() => galleryRef.current?.click()} className="aspect-square rounded-lg border border-white/10 flex items-center justify-center cursor-pointer hover:border-white/20 transition-colors bg-[#1a1a1a]">
                  <Plus size={18} className="text-white/30" />
                </div>
              )}
            </div>
          ) : (
            <div onClick={() => galleryRef.current?.click()} className="bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3.5 flex items-center gap-3 cursor-pointer hover:border-white/20 transition-colors">
              <CloudUpload size={22} className="text-white/30 shrink-0" />
              <div>
                <p className="text-sm text-white/40">Upload multiple images</p>
                <p className="text-xs text-white/25 mt-0.5">Webp, JPEG, PNG · max 5</p>
              </div>
            </div>
          )}
          <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden"
            onChange={(e) => { if (e.target.files) handleGallery(e.target.files); }} />
        </div>

        {/* Availability */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Availability</label>
          {[
            { label: "Website", value: websiteAvail, onChange: setWebsiteAvail },
            { label: "POS", value: posAvail, onChange: setPosAvail },
            { label: "KIOSK", value: kioskAvail, onChange: setKioskAvail },
          ].map(({ label, value, onChange }) => (
            <div key={label} className="flex items-center justify-between bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3">
              <span className="text-sm text-white">{label}</span>
              <Toggle value={value} onChange={onChange} />
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <OfferProductsModal
          existing={editingIdx !== null ? offerItems[editingIdx] : undefined}
          onClose={() => { setShowModal(false); setEditingIdx(null); }}
          onSave={handleModalSave}
        />
      )}
    </div>
  );
}
