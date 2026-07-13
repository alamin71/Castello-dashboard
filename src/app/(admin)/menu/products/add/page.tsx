"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  CloudUpload,
  Plus,
  Minus,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Monitor,
  Printer,
  Tablet,
} from "lucide-react";
import { useCategories } from "@/hooks/queries/useCategories";
import { useVariantCategories } from "@/hooks/queries/useVariantCategories";
import { useVariantItems } from "@/hooks/queries/useVariantItems";
import { useToppingCategories } from "@/hooks/queries/useToppingCategories";
import { useToppingItems } from "@/hooks/queries/useToppingItems";
import { useCreateProduct } from "@/hooks/mutations/useCreateProduct";
import { ToppingCategory } from "@/types/topping.types";
import { ToppingItem } from "@/types/topping.types";

// ── Toggle ────────────────────────────────────────────────────────────────────
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative w-10 h-5 rounded-full transition-colors ${value ? "bg-[#ff4d00]" : "bg-white/20"}`}
    >
      <span
        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${value ? "left-5" : "left-0.5"}`}
      />
    </button>
  );
}

// ── Variant row ───────────────────────────────────────────────────────────────
interface VariantRowData {
  variantCategoryId: string;
  variantItemId: string;
  price: string;
  status: "active" | "inactive";
}

function VariantItemSelect({
  variantCategoryId,
  value,
  onChange,
}: {
  variantCategoryId: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const { data: items = [] } = useVariantItems(
    variantCategoryId ? { variantCategoryId } : {}
  );
  return (
    <div className="relative flex-1">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={!variantCategoryId}
        className="appearance-none w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none cursor-pointer focus:border-white scheme-dark disabled:opacity-40"
      >
        <option value="">Select Item</option>
        {items.map((it) => (
          <option key={it._id} value={it._id}>
            {it.name}
          </option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
    </div>
  );
}

// ── Toppings modal items tab ──────────────────────────────────────────────────
function ToppingItemsTab({
  category,
  selectedItems,
  onToggle,
}: {
  category: ToppingCategory;
  selectedItems: Set<string>;
  onToggle: (id: string) => void;
}) {
  const { data: items = [], isLoading } = useToppingItems({ toppingCategoryId: category._id });

  if (isLoading)
    return <p className="text-sm text-white/30 py-4 text-center">Loading…</p>;
  if (items.length === 0)
    return <p className="text-sm text-white/30 py-4 text-center">No items found.</p>;

  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map((item: ToppingItem) => (
        <label key={item._id} className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={selectedItems.has(item._id)}
            onChange={() => onToggle(item._id)}
            className="w-4 h-4 rounded accent-[#ff4d00]"
          />
          <span className="text-sm text-white">{item.name}</span>
        </label>
      ))}
    </div>
  );
}

// ── Toppings modal ────────────────────────────────────────────────────────────
interface ToppingSelection {
  toppingCategoryIds: string[];
  defaultToppingItemIds: string[];
}

function ToppingsModal({
  onClose,
  onSave,
  initial,
}: {
  onClose: () => void;
  onSave: (sel: ToppingSelection) => void;
  initial: ToppingSelection;
}) {
  const { data: allCategories = [], isLoading } = useToppingCategories({});
  const [step, setStep] = useState<"categories" | "items">("categories");
  const [selectedCatIds, setSelectedCatIds] = useState<Set<string>>(
    new Set(initial.toppingCategoryIds)
  );
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(
    new Set(initial.defaultToppingItemIds)
  );
  const [activeTabId, setActiveTabId] = useState<string>("");

  const selectedCats = allCategories.filter((c) => selectedCatIds.has(c._id));

  const toggleCat = (id: string) => {
    setSelectedCatIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleItem = (id: string) => {
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleNext = () => {
    if (selectedCatIds.size === 0) return;
    setActiveTabId(selectedCats[0]?._id ?? "");
    setStep("items");
  };

  const handleSave = () => {
    onSave({
      toppingCategoryIds: [...selectedCatIds],
      defaultToppingItemIds: [...selectedItemIds],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-[#1a1a1a] rounded-2xl w-full max-w-125 mx-4 border border-white/10">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Toppings</h2>
          <button onClick={onClose} className="text-red-400 hover:text-red-300 transition-colors">
            <X size={20} />
          </button>
        </div>

        {step === "categories" ? (
          <div className="px-6 py-5">
            <p className="text-sm font-medium text-white mb-0.5">Toppings Category</p>
            <p className="text-xs text-white/40 mb-4">Select which topping categories are available for this product.</p>
            {isLoading ? (
              <p className="text-sm text-white/30 py-4 text-center">Loading…</p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {allCategories.map((cat) => (
                  <label
                    key={cat._id}
                    className="flex items-center justify-between px-4 py-3 rounded-xl border border-white/10 cursor-pointer hover:border-white/20 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedCatIds.has(cat._id)}
                        onChange={() => toggleCat(cat._id)}
                        className="w-4 h-4 rounded accent-[#ff4d00]"
                      />
                      <span className="text-sm text-white">{cat.name}</span>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="px-6 py-5">
            <p className="text-sm font-medium text-white mb-0.5">Default Topping Items</p>
            <p className="text-xs text-white/40 mb-4">Select default pre-selected items for each topping category.</p>
            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
              <button type="button" className="p-1 text-white/40 hover:text-white shrink-0">
                <ChevronLeft size={14} />
              </button>
              {selectedCats.map((cat) => (
                <button
                  key={cat._id}
                  type="button"
                  onClick={() => setActiveTabId(cat._id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap border transition-colors ${
                    activeTabId === cat._id
                      ? "border-[#ff4d00] text-[#ff4d00]"
                      : "border-white/15 text-white/50 hover:text-white"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
              <button type="button" className="p-1 text-white/40 hover:text-white shrink-0">
                <ChevronRight size={14} />
              </button>
            </div>
            {activeTabId && (
              <ToppingItemsTab
                key={activeTabId}
                category={allCategories.find((c) => c._id === activeTabId)!}
                selectedItems={selectedItemIds}
                onToggle={toggleItem}
              />
            )}
          </div>
        )}

        <div className="px-6 pb-6 pt-2 border-t border-white/10">
          <div className="flex gap-3 mt-4">
            {step === "categories" ? (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl border border-white/15 text-white text-sm font-medium hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={selectedCatIds.size === 0}
                  className="flex-1 py-3 rounded-xl bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-40"
                >
                  Save & Next
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setStep("categories")}
                  className="flex-1 py-3 rounded-xl border border-white/15 text-white text-sm font-medium hover:bg-white/5 transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="flex-1 py-3 rounded-xl bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors"
                >
                  Save Toppings
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Add Product Page ──────────────────────────────────────────────────────────
export default function AddProductPage() {
  const router = useRouter();

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [productType, setProductType] = useState<"single" | "variant">("single");
  const [price, setPrice] = useState("");
  const [variants, setVariants] = useState<VariantRowData[]>([
    { variantCategoryId: "", variantItemId: "", price: "", status: "active" },
  ]);
  const [toppingSelection, setToppingSelection] = useState<ToppingSelection>({
    toppingCategoryIds: [],
    defaultToppingItemIds: [],
  });
  const [availability, setAvailability] = useState({
    website: true,
    pos: true,
    kiosk: true,
  });
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [gallery, setGallery] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [showToppingsModal, setShowToppingsModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mainImageRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  // API hooks
  const { data: categories = [] } = useCategories({});
  const { data: variantCategories = [] } = useVariantCategories({});
  const { mutate: createProduct, isPending } = useCreateProduct();

  const ordinalSuffix = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  const handleMainImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMainImage(file);
    setMainImagePreview(URL.createObjectURL(file));
  };

  const handleGallery = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, 5);
    setGallery(files);
    setGalleryPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const addVariant = () =>
    setVariants((prev) => [
      ...prev,
      { variantCategoryId: "", variantItemId: "", price: "", status: "active" },
    ]);

  const removeVariant = (idx: number) =>
    setVariants((prev) => prev.filter((_, i) => i !== idx));

  const updateVariant = useCallback(
    (idx: number, field: keyof VariantRowData, value: string) => {
      setVariants((prev) =>
        prev.map((v, i) => {
          if (i !== idx) return v;
          if (field === "variantCategoryId")
            return { ...v, variantCategoryId: value, variantItemId: "" };
          return { ...v, [field]: value };
        })
      );
    },
    []
  );

  const toppingSummary =
    toppingSelection.toppingCategoryIds.length > 0
      ? `${toppingSelection.toppingCategoryIds.length} category selected`
      : "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) return setError("Product name is required.");
    if (!categoryId) return setError("Please select a category.");
    if (productType === "single" && !price) return setError("Price is required for single products.");
    if (productType === "variant" && variants.some((v) => !v.variantCategoryId || !v.variantItemId || !v.price))
      return setError("All variant fields (category, item, price) are required.");
    if (!mainImage) return setError("Main image is required.");

    createProduct(
      {
        name: name.trim(),
        description: description.trim() || undefined,
        categoryId,
        type: productType,
        price: productType === "single" ? Number(price) : undefined,
        toppingCategoryIds: toppingSelection.toppingCategoryIds,
        defaultToppingItemIds: toppingSelection.defaultToppingItemIds,
        availability: {
          website: availability.website,
          pos: availability.pos,
          kiosk: availability.kiosk,
        },
        mainImage: mainImage ?? undefined,
        gallery: gallery.length > 0 ? gallery : undefined,
        variants:
          productType === "variant"
            ? variants.map((v) => ({
                variantCategoryId: v.variantCategoryId,
                variantItemId: v.variantItemId,
                price: Number(v.price),
                status: v.status,
              }))
            : undefined,
      },
      {
        onSuccess: () => router.push("/menu/products"),
        onError: (err: unknown) => {
          const axiosErr = err as { response?: { data?: { message?: string | string[] } } };
          const backendMsg = axiosErr?.response?.data?.message;
          const msg = Array.isArray(backendMsg)
            ? backendMsg.join(", ")
            : backendMsg ?? (err instanceof Error ? err.message : "Failed to create product.");
          setError(msg);
        },
      }
    );
  };

  return (
    <div className="p-6 min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/menu/products"
          className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
        >
          <ChevronLeft size={18} />
        </Link>
        <h1 className="text-2xl font-semibold text-white">Add New Product</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex gap-6">
          {/* Left – Main Form */}
          <div className="flex-1 space-y-5">
            {/* Product Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white">
                <span className="text-red-400">*</span> Product Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter product name"
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-white transition-colors"
              />
            </div>

            {/* Product Description */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white">Product Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write product description"
                rows={4}
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-white transition-colors resize-none"
              />
            </div>

            {/* Category + Toppings */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-white">
                  <span className="text-red-400">*</span> Category
                </label>
                <div className="relative">
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="appearance-none w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none cursor-pointer focus:border-white scheme-dark"
                  >
                    <option value="">Select a category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-white">Toppings</label>
                <button
                  type="button"
                  onClick={() => setShowToppingsModal(true)}
                  className="flex items-center justify-between w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none hover:border-white/20 transition-colors"
                >
                  <span className={toppingSummary ? "text-white text-xs" : "text-white/30"}>
                    {toppingSummary || "Add toppings"}
                  </span>
                  <ChevronRight size={14} className="text-white/40 shrink-0" />
                </button>
              </div>
            </div>

            {/* Item Type */}
            <div className="grid grid-cols-2 gap-4">
              {(["single", "variant"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setProductType(type)}
                  className={`flex items-center justify-between px-5 py-3.5 rounded-xl border text-sm font-medium transition-colors ${
                    productType === type
                      ? "border-[#ff4d00] text-white"
                      : "border-white/10 text-white/50 hover:border-white/20"
                  }`}
                >
                  {type === "single" ? "Single Item" : "Variant Item"}
                  <span
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                      productType === type ? "border-[#ff4d00]" : "border-white/30"
                    }`}
                  >
                    {productType === type && (
                      <span className="w-2 h-2 rounded-full bg-[#ff4d00]" />
                    )}
                  </span>
                </button>
              ))}
            </div>

            {/* Single Item Price */}
            {productType === "single" && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-white">
                  <span className="text-red-400">*</span> Price (Kr.)
                </label>
                <input
                  type="text" inputMode="numeric"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Enter product price"
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-white transition-colors"
                />
              </div>
            )}

            {/* Variant Items */}
            {productType === "variant" && (
              <div className="space-y-3">
                {variants.map((v, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <p className="text-sm text-white/60">{ordinalSuffix(idx + 1)} Variant</p>
                    <div className="flex items-center gap-2">
                      {/* Variant Category */}
                      <div className="relative flex-1">
                        <select
                          value={v.variantCategoryId}
                          onChange={(e) => updateVariant(idx, "variantCategoryId", e.target.value)}
                          className="appearance-none w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none cursor-pointer focus:border-white scheme-dark"
                        >
                          <option value="">Select Category</option>
                          {variantCategories.map((c) => (
                            <option key={c._id} value={c._id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                      </div>

                      {/* Variant Item */}
                      <VariantItemSelect
                        variantCategoryId={v.variantCategoryId}
                        value={v.variantItemId}
                        onChange={(val) => updateVariant(idx, "variantItemId", val)}
                      />

                      {/* Price */}
                      <input
                        type="text" inputMode="numeric"
                        placeholder="Price"
                        value={v.price}
                        onChange={(e) => updateVariant(idx, "price", e.target.value)}
                        className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-white"
                      />

                      <button
                        type="button"
                        onClick={() => removeVariant(idx)}
                        className="text-white/30 hover:text-white transition-colors"
                      >
                        <Minus size={16} />
                      </button>

                      <Toggle
                        value={v.status === "active"}
                        onChange={(val) =>
                          updateVariant(idx, "status", val ? "active" : "inactive")
                        }
                      />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addVariant}
                  className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors mt-2"
                >
                  <Plus size={15} /> Add More Variant
                </button>
              </div>
            )}

            {/* Error */}
            {error && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            {/* Save Button */}
            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={isPending}
                className="px-10 py-3 bg-white text-black text-sm font-medium rounded-xl hover:bg-white/90 transition-colors disabled:opacity-50"
              >
                {isPending ? "Saving…" : "Save Product"}
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
              <div className="relative bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden">
                {mainImagePreview ? (
                  <>
                    <div
                      onClick={() => mainImageRef.current?.click()}
                      className="relative w-full aspect-square cursor-pointer"
                    >
                      <Image
                        src={mainImagePreview}
                        alt="Main image"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setMainImage(null);
                        setMainImagePreview(null);
                        if (mainImageRef.current) mainImageRef.current.value = "";
                      }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors z-10"
                    >
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <div
                    onClick={() => mainImageRef.current?.click()}
                    className="p-6 text-center cursor-pointer hover:border-white/20 transition-colors"
                  >
                    <CloudUpload size={28} className="mx-auto text-white/30 mb-2" />
                    <p className="text-sm text-white/40">Upload an image</p>
                    <p className="text-xs text-white/25 mt-1">Webp, JPEG, PNG · 220×220 px</p>
                  </div>
                )}
              </div>
              <input
                ref={mainImageRef}
                type="file"
                accept="image/*"
                onChange={handleMainImage}
                className="hidden"
              />
            </div>

            {/* Image Gallery */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white">Image Gallery</label>
              {galleryPreviews.length > 0 ? (
                <div className="grid grid-cols-3 gap-1.5">
                  {galleryPreviews.map((src, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-white/5 group">
                      <Image src={src} alt={`Gallery ${i + 1}`} fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          const newFiles = gallery.filter((_, fi) => fi !== i);
                          const newPreviews = galleryPreviews.filter((_, pi) => pi !== i);
                          setGallery(newFiles);
                          setGalleryPreviews(newPreviews);
                        }}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  {gallery.length < 5 && (
                    <div
                      onClick={() => galleryRef.current?.click()}
                      className="aspect-square rounded-lg border border-white/10 flex items-center justify-center cursor-pointer hover:border-white/20 transition-colors bg-[#1a1a1a]"
                    >
                      <Plus size={18} className="text-white/30" />
                    </div>
                  )}
                </div>
              ) : (
                <div
                  onClick={() => galleryRef.current?.click()}
                  className="bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3.5 flex items-center gap-3 cursor-pointer hover:border-white/20 transition-colors"
                >
                  <CloudUpload size={22} className="text-white/30 shrink-0" />
                  <div>
                    <p className="text-sm text-white/40">Upload multiple images</p>
                    <p className="text-xs text-white/25 mt-0.5">Webp, JPEG, PNG · max 5</p>
                  </div>
                </div>
              )}
              <input
                ref={galleryRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleGallery}
                className="hidden"
              />
            </div>

            {/* Availability */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Availability</label>
              {(
                [
                  { key: "website" as const, label: "Website", Icon: Monitor },
                  { key: "pos" as const, label: "POS", Icon: Printer },
                  { key: "kiosk" as const, label: "KIOSK", Icon: Tablet },
                ] as const
              ).map(({ key, label, Icon }) => (
                <div
                  key={key}
                  className="flex items-center justify-between bg-[#1a1a1a] border border-white/10 rounded-xl p-4"
                >
                  <div className="flex items-center gap-3">
                    <Icon size={15} className="text-white/50" />
                    <span className="text-sm text-white">{label}</span>
                  </div>
                  <Toggle
                    value={availability[key]}
                    onChange={(v) => setAvailability((prev) => ({ ...prev, [key]: v }))}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </form>

      {showToppingsModal && (
        <ToppingsModal
          onClose={() => setShowToppingsModal(false)}
          onSave={(sel) => setToppingSelection(sel)}
          initial={toppingSelection}
        />
      )}
    </div>
  );
}
