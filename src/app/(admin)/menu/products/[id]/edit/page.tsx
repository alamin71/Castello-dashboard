"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  CloudUpload,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Monitor,
  Printer,
  Tablet,
  Plus,
  Minus,
  X,
} from "lucide-react";
import { useProduct } from "@/hooks/queries/useProduct";
import { useUpdateProduct } from "@/hooks/mutations/useUpdateProduct";
import { useCategories } from "@/hooks/queries/useCategories";
import { useVariantCategories } from "@/hooks/queries/useVariantCategories";
import { useVariantItems } from "@/hooks/queries/useVariantItems";
import { useToppingCategories } from "@/hooks/queries/useToppingCategories";
import { useToppingItems } from "@/hooks/queries/useToppingItems";
import { ToppingCategory, ToppingItem } from "@/types/topping.types";

function getId(v: string | { _id: string }): string {
  return typeof v === "object" && v !== null ? v._id : v;
}

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
  const { data: variantItemsData } = useVariantItems(
    variantCategoryId ? { variantCategoryId } : {}
  );
  const items = variantItemsData?.result ?? [];
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
  const { data: toppingItemsData, isLoading } = useToppingItems({ toppingCategoryId: category._id, limit: 200 });
  const items = (toppingItemsData?.result ?? []).slice().sort((a, b) => a.name.localeCompare(b.name));
  if (isLoading) return <p className="text-sm text-white/30 py-4 text-center">Loading…</p>;
  if (items.length === 0) return <p className="text-sm text-white/30 py-4 text-center">No items found.</p>;
  return (
    <div className="overflow-y-auto max-h-[308px] pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
      {items.map((item: ToppingItem) => (
        <label key={item._id} className="flex items-center gap-2.5 cursor-pointer py-1">
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
  const { data: toppingCatData, isLoading } = useToppingCategories({});
  const allCategories = toppingCatData?.result ?? [];
  const [step, setStep] = useState<"categories" | "items">("categories");
  const [selectedCatIds, setSelectedCatIds] = useState<Set<string>>(new Set(initial.toppingCategoryIds));
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set(initial.defaultToppingItemIds));
  const [activeTabId, setActiveTabId] = useState<string>("");

  const selectedCats = allCategories.filter((c) => selectedCatIds.has(c._id));

  const toggleCat = (id: string) =>
    setSelectedCatIds((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleItem = (id: string) =>
    setSelectedItemIds((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const handleNext = () => {
    if (selectedCatIds.size === 0) return;
    setActiveTabId(selectedCats[0]?._id ?? "");
    setStep("items");
  };

  const handleSave = () => {
    onSave({ toppingCategoryIds: [...selectedCatIds], defaultToppingItemIds: [...selectedItemIds] });
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
                <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/15 text-white text-sm font-medium hover:bg-white/5 transition-colors">
                  Cancel
                </button>
                <button type="button" onClick={handleNext} disabled={selectedCatIds.size === 0} className="flex-1 py-3 rounded-xl bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-40">
                  Save & Next
                </button>
              </>
            ) : (
              <>
                <button type="button" onClick={() => setStep("categories")} className="flex-1 py-3 rounded-xl border border-white/15 text-white text-sm font-medium hover:bg-white/5 transition-colors">
                  Back
                </button>
                <button type="button" onClick={handleSave} className="flex-1 py-3 rounded-xl bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors">
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

// ── Edit Product Page ─────────────────────────────────────────────────────────
export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: product, isLoading } = useProduct(id);
  const { mutate: updateProduct, isPending } = useUpdateProduct();
  const { data: categoriesData } = useCategories({});
  const categories = categoriesData?.result ?? [];
  const { data: variantCategoriesData } = useVariantCategories({});
  const variantCategories = variantCategoriesData?.result ?? [];

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
  const [availability, setAvailability] = useState({ website: true, pos: true, kiosk: true });

  // Images
  const [newMainImage, setNewMainImage] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [existingGallery, setExistingGallery] = useState<string[]>([]);
  const [removedGallery, setRemovedGallery] = useState<string[]>([]);
  const [newGallery, setNewGallery] = useState<File[]>([]);
  const [newGalleryPreviews, setNewGalleryPreviews] = useState<string[]>([]);

  const [showToppingsModal, setShowToppingsModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  const mainImageRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  // Pre-fill all fields when product loads
  useEffect(() => {
    if (!product || initialized) return;
    setName(product.name);
    setDescription(product.description ?? "");
    setCategoryId(getId(product.categoryId));
    setProductType(product.type);
    if (product.price !== undefined) setPrice(String(product.price));
    if (product.availability) {
      setAvailability({
        website: product.availability.website ?? true,
        pos: product.availability.pos ?? true,
        kiosk: product.availability.kiosk ?? true,
      });
    }
    setToppingSelection({
      toppingCategoryIds: product.toppingCategoryIds.map(getId),
      defaultToppingItemIds: product.defaultToppingItemIds.map(getId),
    });
    setExistingGallery(product.gallery ?? []);
    if (product.type === "variant" && product.variants?.length > 0) {
      setVariants(
        product.variants.map((v) => ({
          variantCategoryId: getId(v.variantCategoryId),
          variantItemId: getId(v.variantItemId),
          price: String(v.price),
          status: v.status,
        }))
      );
    }
    setInitialized(true);
  }, [product, initialized]);

  const handleMainImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewMainImage(file);
    setMainImagePreview(URL.createObjectURL(file));
  };

  const removeNewMainImage = () => {
    setNewMainImage(null);
    setMainImagePreview(null);
    if (mainImageRef.current) mainImageRef.current.value = "";
  };

  const handleGallery = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const totalNow = existingGallery.length + newGallery.length;
    const canAdd = 5 - totalNow;
    if (canAdd <= 0) return;
    const toAdd = files.slice(0, canAdd);
    setNewGallery((prev) => [...prev, ...toAdd]);
    setNewGalleryPreviews((prev) => [...prev, ...toAdd.map((f) => URL.createObjectURL(f))]);
    if (galleryRef.current) galleryRef.current.value = "";
  };

  const removeExistingGallery = (idx: number) => {
    const url = existingGallery[idx];
    setExistingGallery((prev) => prev.filter((_, i) => i !== idx));
    setRemovedGallery((prev) => [...prev, url]);
  };

  const removeNewGallery = (idx: number) => {
    setNewGallery((prev) => prev.filter((_, i) => i !== idx));
    setNewGalleryPreviews((prev) => prev.filter((_, i) => i !== idx));
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
          if (field === "variantCategoryId") return { ...v, variantCategoryId: value, variantItemId: "" };
          return { ...v, [field]: value };
        })
      );
    },
    []
  );

  const ordinalSuffix = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  const toppingSummary =
    toppingSelection.toppingCategoryIds.length > 0
      ? `${toppingSelection.toppingCategoryIds.length} category selected`
      : "";

  const totalGallery = existingGallery.length + newGallery.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError("Product name is required.");
    if (!categoryId) return setError("Please select a category.");
    if (productType === "single" && !price) return setError("Price is required.");
    if (
      productType === "variant" &&
      variants.some((v) => !v.variantCategoryId || !v.variantItemId || !v.price)
    )
      return setError("All variant fields (category, item, price) are required.");

    updateProduct(
      {
        id,
        payload: {
          name: name.trim(),
          description: description.trim() || undefined,
          categoryId,
          type: productType,
          price: productType === "single" ? Number(price) : undefined,
          toppingCategoryIds: toppingSelection.toppingCategoryIds,
          defaultToppingItemIds: toppingSelection.defaultToppingItemIds,
          availability,
          ...(newMainImage && { mainImage: newMainImage }),
          gallery: newGallery.length > 0 ? newGallery : undefined,
          removeGallery: removedGallery.length > 0 ? removedGallery : undefined,
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
      },
      {
        onSuccess: () => router.push("/menu/products"),
        onError: (err: unknown) => {
          const axiosErr = err as { response?: { data?: { message?: string | string[] } } };
          const backendMsg = axiosErr?.response?.data?.message;
          const msg = Array.isArray(backendMsg)
            ? backendMsg.join(", ")
            : backendMsg ?? (err instanceof Error ? err.message : "Failed to update product.");
          setError(msg);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <p className="text-white/40 text-sm">Loading product…</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <p className="text-red-400 text-sm">Product not found.</p>
      </div>
    );
  }

  const currentMainImage = mainImagePreview ?? product.mainImage ?? null;

  return (
    <div className="p-6 min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/menu/products"
          className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
        >
          <ChevronLeft size={18} />
        </Link>
        <h1 className="text-2xl font-semibold text-white">Edit Product</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex gap-6">
          {/* Left */}
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

            {/* Description */}
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

            {/* Item Type — editable */}
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

            {/* Single Price */}
            {productType === "single" && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-white">
                  <span className="text-red-400">*</span> Price (Kr.)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={price}
                  onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))}
                  onKeyDown={(e) => {
                    const allowed = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Home", "End"];
                    if (!/^\d$/.test(e.key) && !allowed.includes(e.key)) e.preventDefault();
                  }}
                  placeholder="Enter product price"
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-white transition-colors"
                />
              </div>
            )}

            {/* Variants */}
            {productType === "variant" && (
              <div className="space-y-3">
                {variants.map((v, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <p className="text-sm text-white/60">{ordinalSuffix(idx + 1)} Variant</p>
                    <div className="flex items-center gap-2">
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

                      <VariantItemSelect
                        variantCategoryId={v.variantCategoryId}
                        value={v.variantItemId}
                        onChange={(val) => updateVariant(idx, "variantItemId", val)}
                      />

                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="Price"
                        value={v.price}
                        onChange={(e) => updateVariant(idx, "price", e.target.value.replace(/\D/g, ""))}
                        onKeyDown={(e) => {
                          const allowed = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Home", "End"];
                          if (!/^\d$/.test(e.key) && !allowed.includes(e.key)) e.preventDefault();
                        }}
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
                        onChange={(val) => updateVariant(idx, "status", val ? "active" : "inactive")}
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

            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={isPending}
                className="px-10 py-3 bg-white text-black text-sm font-medium rounded-xl hover:bg-white/90 transition-colors disabled:opacity-50"
              >
                {isPending ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-65 shrink-0 space-y-5">
            {/* Main Image */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white">Main Image</label>
              <div className="relative bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden">
                {currentMainImage ? (
                  <div className="relative w-full aspect-square">
                    <Image src={currentMainImage} alt={product.name} fill className="object-cover" />
                    {newMainImage && (
                      <button
                        type="button"
                        onClick={removeNewMainImage}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors z-10"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
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
              <button
                type="button"
                onClick={() => mainImageRef.current?.click()}
                className="w-full py-2 text-xs text-white/40 hover:text-white border border-white/10 rounded-xl transition-colors"
              >
                Change Image
              </button>
              <input ref={mainImageRef} type="file" accept="image/*" onChange={handleMainImage} className="hidden" />
            </div>

            {/* Gallery */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white">Image Gallery</label>

              {/* Existing + new thumbnails */}
              {totalGallery > 0 && (
                <div className="grid grid-cols-3 gap-1.5">
                  {existingGallery.map((src, i) => (
                    <div key={`ex-${i}`} className="relative aspect-square rounded-lg overflow-hidden bg-white/5 group">
                      <Image src={src} alt={`Gallery ${i + 1}`} fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => removeExistingGallery(i)}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 z-10"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  {newGalleryPreviews.map((src, i) => (
                    <div key={`nw-${i}`} className="relative aspect-square rounded-lg overflow-hidden bg-white/5 group">
                      <Image src={src} alt={`New ${i + 1}`} fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => removeNewGallery(i)}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 z-10"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add button — always visible when under limit */}
              {totalGallery < 5 && (
                <button
                  type="button"
                  onClick={() => galleryRef.current?.click()}
                  className="w-full flex items-center gap-3 bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 hover:border-white/20 transition-colors cursor-pointer"
                >
                  <CloudUpload size={18} className="text-white/30 shrink-0" />
                  <div className="text-left">
                    <p className="text-sm text-white/40">
                      {totalGallery === 0 ? "Upload gallery images" : "Add more images"}
                    </p>
                    <p className="text-xs text-white/25">{5 - totalGallery} slot(s) remaining</p>
                  </div>
                  <Plus size={16} className="text-white/30 ml-auto shrink-0" />
                </button>
              )}

              <input ref={galleryRef} type="file" accept="image/*" multiple onChange={handleGallery} className="hidden" />
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
