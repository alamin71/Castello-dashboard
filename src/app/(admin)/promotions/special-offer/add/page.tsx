"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CloudUpload, Plus, X, ChevronLeft, ChevronRight, Search, Trash2,
} from "lucide-react";
import { useCategories } from "@/hooks/queries/useCategories";
import { useProducts } from "@/hooks/queries/useProducts";
import { useCreateOffer } from "@/hooks/mutations/useCreateOffer";
import { ProductItem, ProductVariantEntry } from "@/types/product.types";

interface OfferProductEntry {
  productId: string;
  productName: string;
  variantItemIds: string[];
}

interface OfferItemState {
  categoryId: string;
  categoryName: string;
  isFixed: boolean;
  products: OfferProductEntry[];
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

function getVariantId(v: ProductVariantEntry): string {
  return typeof v.variantItemId === "string" ? v.variantItemId : v.variantItemId._id;
}

function getVariantName(v: ProductVariantEntry): string {
  return typeof v.variantItemId === "string" ? v.variantItemId : v.variantItemId.name;
}

function OfferProductsModal({
  existing,
  onClose,
  onSave,
}: {
  existing?: OfferItemState;
  onClose: () => void;
  onSave: (item: OfferItemState) => void;
}) {
  const [step, setStep] = useState<"categories" | "products">(existing ? "products" : "categories");
  const [catId, setCatId] = useState(existing?.categoryId ?? "");
  const [catName, setCatName] = useState(existing?.categoryName ?? "");
  const [isFixed, setIsFixed] = useState(existing?.isFixed ?? false);
  const [selections, setSelections] = useState<Map<string, Set<string>>>(() => {
    const map = new Map<string, Set<string>>();
    existing?.products.forEach((p) => map.set(p.productId, new Set(p.variantItemIds)));
    return map;
  });
  const [productSearch, setProductSearch] = useState("");

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

  const toggleProduct = (productId: string) => {
    setSelections((prev) => {
      const next = new Map(prev);
      if (next.has(productId)) next.delete(productId);
      else next.set(productId, new Set());
      return next;
    });
  };

  const toggleVariant = (productId: string, variantItemId: string) => {
    setSelections((prev) => {
      const next = new Map(prev);
      const vSet = new Set(next.get(productId) ?? []);
      if (vSet.has(variantItemId)) vSet.delete(variantItemId);
      else vSet.add(variantItemId);
      if (vSet.size === 0) next.delete(productId);
      else next.set(productId, vSet);
      return next;
    });
  };

  const handleSave = () => {
    const productsList: OfferProductEntry[] = Array.from(selections.entries()).map(
      ([productId, variantIds]) => ({
        productId,
        productName: products.find((p) => p._id === productId)?.name ?? "",
        variantItemIds: Array.from(variantIds),
      })
    );
    onSave({ categoryId: catId, categoryName: catName, isFixed, products: productsList });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-[#1a1a1a] rounded-2xl w-full max-w-130 mx-4 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            {step === "products" && !existing && (
              <button type="button" onClick={() => setStep("categories")} className="p-1 text-white/40 hover:text-white transition-colors">
                <ChevronLeft size={18} />
              </button>
            )}
            <h2 className="text-lg font-semibold text-white">
              {step === "categories" ? "Select Category" : catName}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="text-red-400 hover:text-red-300 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {step === "categories" ? (
            <>
              <p className="text-xs text-white/40 mb-4">Select a category to add products from</p>
              <div className="space-y-2">
                {categories.length === 0 ? (
                  <p className="text-sm text-white/40 text-center py-8">No categories available.</p>
                ) : (
                  categories.map((cat) => (
                    <button
                      key={cat._id}
                      type="button"
                      onClick={() => {
                        setCatId(cat._id);
                        setCatName(cat.name);
                        setSelections(new Map());
                        setStep("products");
                      }}
                      className="flex items-center justify-between w-full px-4 py-3 rounded-xl border border-white/10 hover:border-white/20 transition-colors"
                    >
                      <span className="text-sm text-white">{cat.name}</span>
                      <ChevronRight size={14} className="text-white/40" />
                    </button>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="space-y-4">
              {/* Fixed toggle */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#0f0f0f] rounded-xl border border-white/8">
                <div>
                  <p className="text-sm font-medium text-white">Fixed Category</p>
                  <p className="text-xs text-white/40 mt-0.5">Products cannot be substituted</p>
                </div>
                <Toggle value={isFixed} onChange={setIsFixed} />
              </div>

              {/* Search */}
              <div className="flex items-center gap-2 bg-[#0f0f0f] border border-white/10 rounded-xl px-4 py-2.5 focus-within:border-white transition-colors">
                <Search size={14} className="text-white/30 shrink-0" />
                <input
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search products..."
                  className="bg-transparent text-sm text-white placeholder-white/30 outline-none w-full"
                />
              </div>

              {/* Products list */}
              {productsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="skeleton h-18 rounded-xl" />
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <p className="text-sm text-white/40 text-center py-8">No products found.</p>
              ) : (
                <div className="space-y-3">
                  {filteredProducts.map((product) => {
                    const isSelected = selections.has(product._id);
                    const selectedVariants = selections.get(product._id) ?? new Set<string>();
                    const uniqueVariants = product.variants.reduce<{ id: string; name: string; price: number }[]>(
                      (acc, v) => {
                        const id = getVariantId(v);
                        if (!acc.find((x) => x.id === id)) acc.push({ id, name: getVariantName(v), price: v.price });
                        return acc;
                      },
                      []
                    );

                    return (
                      <div
                        key={product._id}
                        className={`p-3 rounded-xl border transition-colors ${isSelected ? "border-white/25 bg-white/4" : "border-white/10"}`}
                      >
                        <div className="flex items-start gap-3">
                          {product.mainImage ? (
                            <img src={product.mainImage} alt={product.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-white/8 shrink-0 flex items-center justify-center text-white/30 text-xs font-medium">
                              {product.name[0]}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white font-medium">{product.name}</p>
                            {product.description && (
                              <p className="text-xs text-white/40 truncate">{product.description}</p>
                            )}
                            {product.type === "variant" && uniqueVariants.length > 0 && (
                              <div className="flex gap-1.5 flex-wrap mt-2">
                                {uniqueVariants.map((v) => (
                                  <label
                                    key={v.id}
                                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs cursor-pointer transition-colors ${
                                      selectedVariants.has(v.id)
                                        ? "border-white/40 bg-white/8 text-white"
                                        : "border-white/12 text-white/50"
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={selectedVariants.has(v.id)}
                                      onChange={() => toggleVariant(product._id, v.id)}
                                      className="w-3 h-3 rounded accent-white"
                                    />
                                    {v.name} · {v.price.toLocaleString()} kr.
                                  </label>
                                ))}
                              </div>
                            )}
                            {product.type === "single" && product.price !== undefined && (
                              <p className="text-xs text-white/50 mt-1">{product.price.toLocaleString()} kr.</p>
                            )}
                          </div>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleProduct(product._id)}
                            className="w-4 h-4 rounded accent-white mt-0.5 shrink-0 cursor-pointer"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-6 pb-6 pt-4 border-t border-white/10 shrink-0">
          <div className="flex gap-3">
            {step === "categories" || existing ? (
              <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/15 text-white text-sm font-medium hover:bg-white/5 transition-colors">
                Cancel
              </button>
            ) : (
              <button type="button" onClick={() => setStep("categories")} className="flex-1 py-3 rounded-xl border border-white/15 text-white text-sm font-medium hover:bg-white/5 transition-colors">
                Back
              </button>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={step === "categories" || selections.size === 0}
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

export default function CreateOfferPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [offerItems, setOfferItems] = useState<OfferItemState[]>([]);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [homeDelivery, setHomeDelivery] = useState(true);
  const [takeaway, setTakeaway] = useState(false);
  const [websiteAvail, setWebsiteAvail] = useState(true);
  const [posAvail, setPosAvail] = useState(false);
  const [kioskAvail, setKioskAvail] = useState(false);
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [gallery, setGallery] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  const mainImageRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const { mutate: createOffer, isPending } = useCreateOffer();

  const openModal = (idx?: number) => {
    setEditingIdx(idx ?? null);
    setShowModal(true);
  };

  const handleModalSave = (item: OfferItemState) => {
    if (editingIdx !== null) {
      setOfferItems((prev) => prev.map((x, i) => (i === editingIdx ? item : x)));
    } else {
      setOfferItems((prev) => [...prev, item]);
    }
    setShowModal(false);
    setEditingIdx(null);
  };

  const removeOfferItem = (idx: number) => {
    setOfferItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleMainImage = (file: File) => {
    setMainImage(file);
    setMainImagePreview(URL.createObjectURL(file));
  };

  const handleGallery = (files: FileList) => {
    const arr = Array.from(files);
    setGallery((prev) => [...prev, ...arr]);
    setGalleryPreviews((prev) => [...prev, ...arr.map((f) => URL.createObjectURL(f))]);
  };

  const removeGalleryItem = (idx: number) => {
    setGallery((prev) => prev.filter((_, i) => i !== idx));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const isValid = title.trim() && price && Number(price) > 0 && mainImage && offerItems.length > 0;

  const handleSubmit = () => {
    if (!isValid || !mainImage) return;
    createOffer(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        price: Number(price),
        offerItems: offerItems.map((item) => ({
          categoryId: item.categoryId,
          isFixed: item.isFixed,
          products: item.products.map((p) => ({
            productId: p.productId,
            variantItemIds: p.variantItemIds,
          })),
        })),
        availability: { website: websiteAvail, pos: posAvail, kiosk: kioskAvail },
        availableFor: { homeDelivery, takeaway },
        mainImage,
        gallery: gallery.length > 0 ? gallery : undefined,
      },
      { onSuccess: () => router.push("/promotions/special-offer") }
    );
  };

  return (
    <div className="p-6 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/promotions/special-offer"
          className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
        >
          <ChevronLeft size={18} />
        </Link>
        <h1 className="text-2xl font-semibold text-white">Create New Offer</h1>
      </div>

      <div className="flex gap-6">
        {/* Left — Main Form */}
        <div className="flex-1 space-y-5">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white">
              <span className="text-red-400">*</span> Offer Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter offer title"
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-white transition-colors"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white">Offer Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write offer description"
              rows={4}
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-white transition-colors resize-none"
            />
          </div>

          {/* Price */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white">
              <span className="text-red-400">*</span> Price (Kr.)
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter offer price"
              min={0}
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-white transition-colors"
            />
          </div>

          {/* Offer Items */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">
              <span className="text-red-400">*</span> Offer Products
            </label>
            {offerItems.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <p className="text-xs text-white/40">Item {idx + 1}</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openModal(idx)}
                    className="flex-1 flex items-center justify-between bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-sm hover:border-white/20 transition-colors"
                  >
                    <span className="text-white text-left">
                      <span className="font-medium">{item.categoryName}</span>
                      <span className="text-white/50 ml-2">
                        — {item.products.length} product{item.products.length !== 1 ? "s" : ""}
                        {item.isFixed && <span className="ml-2 text-xs text-white/30">(Fixed)</span>}
                      </span>
                    </span>
                    <ChevronRight size={14} className="text-white/40 shrink-0 ml-2" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeOfferItem(idx)}
                    className="p-3 text-red-400/60 hover:text-red-400 hover:bg-red-400/8 rounded-xl transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => openModal()}
              className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors mt-1"
            >
              <Plus size={15} /> Add Offer Item
            </button>
          </div>

          {/* Available For */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">
              <span className="text-red-400">*</span> Offer Available For
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex items-center justify-between px-4 py-3.5 rounded-xl border cursor-pointer transition-colors ${homeDelivery ? "border-white/30 bg-white/4" : "border-white/10 hover:border-white/20"}`}
              >
                <span className="text-sm text-white">Home Delivery</span>
                <input
                  type="checkbox"
                  checked={homeDelivery}
                  onChange={(e) => setHomeDelivery(e.target.checked)}
                  className="w-4 h-4 rounded accent-white"
                />
              </label>
              <label
                className={`flex items-center justify-between px-4 py-3.5 rounded-xl border cursor-pointer transition-colors ${takeaway ? "border-white/30 bg-white/4" : "border-white/10 hover:border-white/20"}`}
              >
                <span className="text-sm text-white">Take Away</span>
                <input
                  type="checkbox"
                  checked={takeaway}
                  onChange={(e) => setTakeaway(e.target.checked)}
                  className="w-4 h-4 rounded accent-white"
                />
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isValid || isPending}
              className="px-10 py-3 bg-white text-black text-sm font-medium rounded-xl hover:bg-white/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isPending ? "Saving..." : "Save Offer"}
            </button>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-65 shrink-0 space-y-5">
          {/* Main Image */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white">
              <span className="text-red-400">*</span> Main Image
            </label>
            <div
              onClick={() => mainImageRef.current?.click()}
              className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5 text-center cursor-pointer hover:border-white/20 transition-colors overflow-hidden"
            >
              {mainImagePreview ? (
                <img src={mainImagePreview} alt="main" className="w-full h-32 object-cover rounded-lg" />
              ) : (
                <>
                  <CloudUpload size={28} className="mx-auto text-white/30 mb-2" />
                  <p className="text-sm text-white/40">Upload an image</p>
                  <p className="text-xs text-white/25 mt-1">Webp, JPEG, PNG · 1320×520 px</p>
                </>
              )}
            </div>
            <input
              ref={mainImageRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleMainImage(f); }}
            />
          </div>

          {/* Gallery */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white">Image Gallery</label>
            {galleryPreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-1.5 mb-2">
                {galleryPreviews.map((src, i) => (
                  <div key={i} className="relative group">
                    <img src={src} alt="" className="w-full h-16 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => removeGalleryItem(i)}
                      className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} className="text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div
              onClick={() => galleryRef.current?.click()}
              className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5 text-center cursor-pointer hover:border-white/20 transition-colors"
            >
              <CloudUpload size={24} className="mx-auto text-white/30 mb-2" />
              <p className="text-sm text-white/40">Upload gallery images</p>
              <p className="text-xs text-white/25 mt-1">Multiple files allowed</p>
            </div>
            <input
              ref={galleryRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => { if (e.target.files) handleGallery(e.target.files); }}
            />
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
