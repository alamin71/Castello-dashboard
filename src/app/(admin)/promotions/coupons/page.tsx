"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import {
  Plus, Search, ChevronDown, ChevronLeft, ChevronRight,
  Pencil, Trash2, X, MoreVertical, Ban, CircleCheck, ArrowLeft,
} from "lucide-react";
import { useRef, useEffect } from "react";

import { useCoupons } from "@/hooks/queries/useCoupons";
import { useCreateCoupon } from "@/hooks/mutations/useCreateCoupon";
import { useUpdateCoupon } from "@/hooks/mutations/useUpdateCoupon";
import { useDeleteCoupon } from "@/hooks/mutations/useDeleteCoupon";
import { useCategories } from "@/hooks/queries/useCategories";
import { useProducts } from "@/hooks/queries/useProducts";

import { CouponItem, CreateCouponPayload } from "@/types/coupon.types";
import { ProductItem, ProductVariantEntry } from "@/types/product.types";

// ─── helpers ──────────────────────────────────────────────────────────────────

function extractId(val: unknown): string {
  if (typeof val === "string") return val;
  if (val && typeof val === "object" && "_id" in val) return (val as { _id: string })._id;
  return "";
}

function getVariantId(v: ProductVariantEntry): string {
  return extractId(v.variantItemId);
}

function getVariantName(v: ProductVariantEntry): string {
  if (typeof v.variantItemId === "string") return v.variantItemId;
  return v.variantItemId.name;
}

function fmtDate(iso: string, withSeconds = false) {
  const d = new Date(iso);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const day = d.getDate().toString().padStart(2, "0");
  const month = months[d.getMonth()];
  const year = d.getFullYear().toString().slice(2);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const s = d.getSeconds().toString().padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  const hr = (h % 12 || 12).toString().padStart(2, "0");
  const time = withSeconds ? `${hr}:${m}:${s} ${ampm}` : `${hr}:${m} ${ampm}`;
  return { date: `${day} ${month} ${year}`, time };
}

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ─── DateCell ─────────────────────────────────────────────────────────────────

function DateCell({ iso, withSeconds }: { iso: string; withSeconds?: boolean }) {
  const { date, time } = fmtDate(iso, withSeconds);
  return (
    <td className="px-5 py-4 whitespace-nowrap">
      <p className="text-sm text-white/70">{date}</p>
      <p className="text-xs text-white/40 mt-0.5">{time}</p>
    </td>
  );
}

// ─── StatusBadge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: "active" | "inactive" }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border ${
      status === "active" ? "border-emerald-500 text-emerald-400" : "border-red-500 text-red-400"
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === "active" ? "bg-emerald-400" : "bg-red-400"}`} />
      {status === "active" ? "Active" : "Inactive"}
    </span>
  );
}

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${value ? "bg-[#e85d26]" : "bg-white/20"}`}
    >
      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${value ? "left-5" : "left-0.5"}`} />
    </button>
  );
}

// ─── SkeletonRow ──────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="border-b border-white/4">
      {Array.from({ length: 9 }).map((_, i) => (
        <td key={i} className="px-5 py-4">
          <div className="h-4 bg-white/6 rounded animate-pulse" style={{ width: `${60 + (i % 3) * 20}%` }} />
        </td>
      ))}
    </tr>
  );
}

// ─── DeleteConfirmModal ───────────────────────────────────────────────────────

function DeleteConfirmModal({ coupon, onClose }: { coupon: CouponItem; onClose: () => void }) {
  const { mutate: deleteCoupon, isPending } = useDeleteCoupon();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-sm mx-4 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
            <Trash2 size={18} className="text-red-400" />
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>
        <h3 className="text-base font-semibold text-white mb-1">Delete Coupon</h3>
        <p className="text-sm text-white/50 mb-6">
          Are you sure you want to delete{" "}
          <span className="text-white font-medium">{coupon.name}</span>? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-white/15 text-sm text-white font-medium hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => deleteCoupon(coupon._id, { onSuccess: onClose })}
            disabled={isPending}
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {isPending ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SelectProductsModal ──────────────────────────────────────────────────────

type SelectedProduct = { productId: string; variantItemIds: string[] };

function SelectProductsModal({
  initialProducts,
  onClose,
  onSave,
}: {
  initialProducts: SelectedProduct[];
  onClose: () => void;
  onSave: (products: SelectedProduct[]) => void;
}) {
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [selectedVariantIds, setSelectedVariantIds] = useState<Set<string>>(new Set());
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(
    new Set(initialProducts.map((p) => p.productId))
  );
  const [productVariantSel, setProductVariantSel] = useState<Map<string, Set<string>>>(() => {
    const m = new Map<string, Set<string>>();
    initialProducts.forEach((p) => m.set(p.productId, new Set(p.variantItemIds)));
    return m;
  });

  const categoriesRef = useRef<HTMLDivElement>(null);

  const { data: catData } = useCategories({ limit: 100 });
  const categories = catData?.result ?? [];

  useEffect(() => {
    if (categories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categories[0]._id);
    }
  }, [categories, selectedCategoryId]);

  const { data: productData, isLoading: productsLoading } = useProducts(
    selectedCategoryId ? { categoryId: selectedCategoryId, limit: 100 } : {},
    { enabled: !!selectedCategoryId }
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

  const allVariantsSelected =
    allVariants.length > 0 && allVariants.every((v) => selectedVariantIds.has(v.id));
  const allProductsSelected =
    filteredProducts.length > 0 && filteredProducts.every((p) => selectedProductIds.has(p._id));

  const toggleVariant = (id: string) =>
    setSelectedVariantIds((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const toggleProduct = (product: ProductItem) => {
    const id = product._id;
    if (selectedProductIds.has(id)) {
      setSelectedProductIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
    } else {
      setSelectedProductIds((prev) => { const n = new Set(prev); n.add(id); return n; });
      if (!productVariantSel.has(id)) {
        setProductVariantSel((pm) =>
          new Map(pm).set(id, new Set(product.variants.map((v) => getVariantId(v))))
        );
      }
    }
  };

  const toggleProductVariant = (productId: string, variantId: string) => {
    setProductVariantSel((prev) => {
      const n = new Map(prev);
      const cur = new Set(n.get(productId) ?? []);
      cur.has(variantId) ? cur.delete(variantId) : cur.add(variantId);
      n.set(productId, cur);
      return n;
    });
  };

  const handleSave = () => {
    const result: SelectedProduct[] = Array.from(selectedProductIds).map((productId) => ({
      productId,
      variantItemIds: Array.from(productVariantSel.get(productId) ?? []),
    }));
    onSave(result);
  };

  const scrollCats = (dir: "left" | "right") =>
    categoriesRef.current?.scrollBy({ left: dir === "left" ? -160 : 160, behavior: "smooth" });

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70">
      <div className="bg-[#1a1a1a] rounded-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col border border-white/8">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-white/8 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/50 hover:bg-white/8 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <h2 className="text-lg font-semibold text-white">Select Products</h2>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Category tabs */}
          <div>
            <p className="text-sm font-medium text-white mb-3">Product Categories</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollCats("left")}
                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/6 transition-colors shrink-0"
              >
                <ChevronLeft size={16} />
              </button>
              <div ref={categoriesRef} className="flex-1 flex gap-2 overflow-x-auto scrollbar-hide">
                {categories.map((cat) => {
                  const isSel = selectedCategoryId === cat._id;
                  const count = (cat as unknown as { totalProducts?: number }).totalProducts ?? 0;
                  return (
                    <button
                      key={cat._id}
                      type="button"
                      onClick={() => { setSelectedCategoryId(cat._id); setProductSearch(""); }}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium whitespace-nowrap shrink-0 transition-all ${
                        isSel
                          ? "border-[#e85d26] bg-[#e85d26]/8 text-white"
                          : "border-white/10 bg-transparent text-white/50 hover:border-white/20 hover:text-white/70"
                      }`}
                    >
                      <span>{cat.name}</span>
                      <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-md ${
                        isSel ? "bg-[#e85d26]/20 text-[#e85d26]" : "bg-white/8 text-white/35"
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() => scrollCats("right")}
                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/6 transition-colors shrink-0"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Global variant chips */}
          {!productsLoading && allVariants.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-sm font-medium text-white">
                  <span className="text-[#e85d26] mr-0.5">*</span>Choose Product Variant
                </p>
                <button
                  type="button"
                  onClick={() =>
                    allVariantsSelected
                      ? setSelectedVariantIds(new Set())
                      : setSelectedVariantIds(new Set(allVariants.map((v) => v.id)))
                  }
                  className="text-xs text-white/50 hover:text-white transition-colors"
                >
                  Select all
                </button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {allVariants.map((v) => {
                  const sel = selectedVariantIds.has(v.id);
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => toggleVariant(v.id)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                        sel
                          ? "border-[#e85d26] bg-[#e85d26]/8 text-white"
                          : "border-white/12 text-white/45 hover:border-white/22"
                      }`}
                    >
                      {v.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Products section */}
          <div>
            <div className="flex items-start justify-between mb-1">
              <div>
                <p className="text-sm font-medium text-white">Choose product</p>
                <p className="text-xs text-white/40 mt-0.5">You can add multiple products into this coupon.</p>
              </div>
              <label className="flex items-center gap-1.5 cursor-pointer mt-0.5">
                <input
                  type="checkbox"
                  checked={allProductsSelected}
                  onChange={() => {
                    if (allProductsSelected) {
                      setSelectedProductIds(new Set());
                    } else {
                      setSelectedProductIds((prev) => new Set([...prev, ...filteredProducts.map((p) => p._id)]));
                      const newVariantSel = new Map(productVariantSel);
                      filteredProducts.forEach((p) => {
                        if (!newVariantSel.has(p._id)) {
                          newVariantSel.set(p._id, new Set(p.variants.map((v) => getVariantId(v))));
                        }
                      });
                      setProductVariantSel(newVariantSel);
                    }
                  }}
                  className="w-4 h-4 rounded accent-[#e85d26]"
                />
                <span className="text-xs text-white/50">Select all</span>
              </label>
            </div>

            <div className="flex items-center gap-2 border border-white/10 rounded-xl px-3.5 py-2.5 mt-3 mb-3 focus-within:border-white/25 transition-colors bg-[#141414]">
              <Search size={14} className="text-white/30 shrink-0" />
              <input
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search product name to add"
                className="bg-transparent text-sm text-white placeholder-white/30 outline-none w-full"
              />
            </div>

            {productsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-20 rounded-xl bg-white/4 animate-pulse" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <p className="text-sm text-white/40 text-center py-8">No products found.</p>
            ) : (
              <div className="space-y-3">
                {filteredProducts.map((product) => {
                  const isSelected = selectedProductIds.has(product._id);
                  const variantSel = productVariantSel.get(product._id) ?? new Set<string>();

                  const displayVariants = product.variants
                    .reduce<{ id: string; name: string; price: number }[]>((acc, v) => {
                      const id = getVariantId(v);
                      if (!acc.find((x) => x.id === id))
                        acc.push({ id, name: getVariantName(v), price: v.price });
                      return acc;
                    }, [])
                    .filter((v) => selectedVariantIds.size === 0 || selectedVariantIds.has(v.id));

                  return (
                    <div
                      key={product._id}
                      onClick={() => toggleProduct(product)}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? "border-[#e85d26]/35 bg-[#e85d26]/4"
                          : "border-white/8 hover:border-white/16"
                      }`}
                    >
                      {product.mainImage ? (
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-white/6">
                          <Image
                            src={product.mainImage}
                            alt={product.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-white/8 shrink-0 flex items-center justify-center text-white/40 text-lg font-semibold">
                          {product.name[0]}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium">{product.name}</p>
                        {product.description && (
                          <p className="text-xs text-white/40 truncate">{product.description}</p>
                        )}
                        {product.type === "variant" && displayVariants.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-white/40 mb-1.5">Choose Variant</p>
                            <div className="flex gap-1.5 flex-wrap">
                              {displayVariants.map((v) => {
                                const vSel = isSelected ? variantSel.has(v.id) : false;
                                return (
                                  <button
                                    key={v.id}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (!isSelected) return;
                                      toggleProductVariant(product._id, v.id);
                                    }}
                                    className={`flex flex-col items-center px-3 py-1.5 rounded-lg border text-xs transition-colors ${
                                      vSel
                                        ? "border-[#e85d26]/50 text-white"
                                        : "border-white/10 text-white/35"
                                    }`}
                                  >
                                    <span className="font-medium">{v.name}</span>
                                    <span className="text-white/50">{v.price.toLocaleString()} kr.</span>
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
                      <div onClick={(e) => e.stopPropagation()} className="mt-0.5 shrink-0">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleProduct(product)}
                          className="w-4 h-4 rounded accent-[#e85d26] cursor-pointer"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-4 border-t border-white/8 shrink-0">
          <button
            type="button"
            onClick={handleSave}
            className="w-full py-3.5 bg-white text-black text-sm font-semibold rounded-xl hover:bg-white/90 transition-colors"
          >
            Save Product{selectedProductIds.size > 0 ? ` (${selectedProductIds.size})` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── CouponModal ──────────────────────────────────────────────────────────────

function CouponModal({ initialData, onClose }: { initialData?: CouponItem; onClose: () => void }) {
  const isEdit = !!initialData;

  const [name, setName] = useState(initialData?.name ?? "");
  const [code, setCode] = useState(initialData?.code ?? "");
  const [discountMethod, setDiscountMethod] = useState<"percent" | "amount">(
    initialData?.discountMethod ?? "amount"
  );
  const [discountValue, setDiscountValue] = useState(
    initialData ? String(initialData.discountValue) : ""
  );
  const [minimumOrder, setMinimumOrder] = useState(
    initialData ? String(initialData.minimumOrder) : ""
  );
  const [startDate, setStartDate] = useState(
    initialData?.startDate ? toLocalInput(initialData.startDate) : ""
  );
  const [expireDate, setExpireDate] = useState(
    initialData?.expireDate ? toLocalInput(initialData.expireDate) : ""
  );
  const [applicableForAll, setApplicableForAll] = useState(initialData?.applicableForAll ?? true);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(
    initialData?.products?.map((p) => ({
      productId: extractId(p.productId),
      variantItemIds: p.variantItemIds.map((v) => extractId(v)),
    })) ?? []
  );
  const [showProductModal, setShowProductModal] = useState(false);

  const { mutate: createCoupon, isPending: isCreating } = useCreateCoupon();
  const { mutate: updateCoupon, isPending: isUpdating } = useUpdateCoupon();
  const isPending = isCreating || isUpdating;

  const isValid =
    name.trim() &&
    code.trim() &&
    Number(discountValue) > 0 &&
    minimumOrder !== "" &&
    startDate &&
    expireDate;

  const handleSubmit = () => {
    if (!isValid) return;
    const payload: CreateCouponPayload = {
      name: name.trim(),
      code: code.trim().toUpperCase(),
      discountMethod,
      discountValue: Number(discountValue),
      minimumOrder: Number(minimumOrder),
      startDate: new Date(startDate).toISOString(),
      expireDate: new Date(expireDate).toISOString(),
      applicableForAll,
      ...(!applicableForAll ? { products: selectedProducts } : {}),
    };
    if (isEdit) {
      updateCoupon({ id: initialData._id, payload }, { onSuccess: onClose });
    } else {
      createCoupon(payload, { onSuccess: onClose });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-[#1a1a1a] rounded-2xl w-full max-w-xl mx-4 max-h-[92vh] overflow-y-auto border border-white/8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/8 sticky top-0 bg-[#1a1a1a] z-10">
          <h2 className="text-lg font-semibold text-white">
            {isEdit ? "Edit Coupon" : "Add New Coupon"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Name + Code */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white">
                <span className="text-[#e85d26] mr-0.5">*</span>Coupon Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter coupon name"
                className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-white/30 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white">
                <span className="text-[#e85d26] mr-0.5">*</span>Coupon Code
              </label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. SAVE20"
                className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-white/30 transition-colors tracking-widest"
              />
            </div>
          </div>

          {/* Discount Method */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white">
              <span className="text-[#e85d26] mr-0.5">*</span>Discount Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(["percent", "amount"] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setDiscountMethod(method)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                    discountMethod === method
                      ? "border-[#e85d26]/60 bg-[#e85d26]/5"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      discountMethod === method ? "border-[#e85d26]" : "border-white/30"
                    }`}
                  >
                    {discountMethod === method && (
                      <span className="w-2 h-2 rounded-full bg-[#e85d26]" />
                    )}
                  </span>
                  <span className={`text-sm font-medium ${discountMethod === method ? "text-white" : "text-white/50"}`}>
                    {method === "percent" ? "Percent (%)" : "Amount (kr.)"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Discount Value + Min Order */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white">
                <span className="text-[#e85d26] mr-0.5">*</span>Discount Value
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder="e.g. 20"
                  min={0}
                  className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-white/30 outline-none focus:border-white/30 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-white/35 pointer-events-none">
                  {discountMethod === "percent" ? "%" : "kr."}
                </span>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white">
                <span className="text-[#e85d26] mr-0.5">*</span>Minimum Order (kr.)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={minimumOrder}
                  onChange={(e) => setMinimumOrder(e.target.value)}
                  placeholder="e.g. 5000"
                  min={0}
                  className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-white/30 outline-none focus:border-white/30 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-white/35 pointer-events-none">
                  kr.
                </span>
              </div>
            </div>
          </div>

          {/* Start Date + Expire Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white">
                <span className="text-[#e85d26] mr-0.5">*</span>Start Date
              </label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-white/30 transition-colors [color-scheme:dark]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white">
                <span className="text-[#e85d26] mr-0.5">*</span>Expire Date
              </label>
              <input
                type="datetime-local"
                value={expireDate}
                onChange={(e) => setExpireDate(e.target.value)}
                className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-white/30 transition-colors [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Product Eligibility */}
          <div className="space-y-2.5">
            <label className="text-sm font-medium text-white">Product Eligibility</label>
            <div className="flex items-center justify-between bg-[#141414] border border-white/10 rounded-xl px-4 py-3.5">
              <span className="text-sm text-white/70">
                Applicable for all offers, products &amp; variants?
              </span>
              <Toggle value={applicableForAll} onChange={setApplicableForAll} />
            </div>

            {applicableForAll ? (
              <div className="flex items-center justify-between w-full bg-[#141414]/40 border border-white/6 rounded-xl px-4 py-3.5 opacity-40 cursor-not-allowed select-none">
                <span className="text-sm text-white/50">Select products from list</span>
                <ChevronRight size={16} className="text-white/25" />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowProductModal(true)}
                className="flex items-center justify-between w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3.5 hover:border-white/22 transition-colors"
              >
                <span className="text-sm text-white/60">
                  {selectedProducts.length > 0
                    ? `${selectedProducts.length} product${selectedProducts.length !== 1 ? "s" : ""} selected`
                    : "Select products from list"}
                </span>
                <ChevronRight size={16} className="text-white/40" />
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3.5 rounded-xl border border-white/15 text-white text-sm font-semibold hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isValid || isPending}
            className="flex-1 py-3.5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isPending ? "Saving…" : isEdit ? "Update Coupon" : "Save Coupon"}
          </button>
        </div>
      </div>

      {showProductModal && (
        <SelectProductsModal
          initialProducts={selectedProducts}
          onClose={() => setShowProductModal(false)}
          onSave={(products) => {
            setSelectedProducts(products);
            setShowProductModal(false);
          }}
        />
      )}
    </div>
  );
}

// ─── Pagination ────────────────────────────────────────────────────────────────

function Pagination({
  page,
  totalPages,
  limit,
  onPageChange,
  onLimitChange,
}: {
  page: number;
  totalPages: number;
  limit: number;
  onPageChange: (p: number) => void;
  onLimitChange: (l: number) => void;
}) {
  const count = Math.min(totalPages, 7);
  let start = 1;
  if (totalPages > 7) {
    if (page <= 4) start = 1;
    else if (page >= totalPages - 3) start = totalPages - 6;
    else start = page - 3;
  }
  const pages = Array.from({ length: count }, (_, i) => start + i);

  return (
    <div className="flex items-center justify-between pt-4">
      <div className="flex items-center gap-2 text-sm text-white/40">
        <span>Showing per page</span>
        <div className="relative">
          <select
            value={limit}
            onChange={(e) => { onLimitChange(Number(e.target.value)); onPageChange(1); }}
            className="appearance-none bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-1.5 pr-7 text-sm text-white outline-none cursor-pointer [color-scheme:dark]"
          >
            {[10, 20, 50, 100].map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
          <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:bg-white/8 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-colors ${
              p === page ? "bg-white text-black font-semibold" : "text-white/50 hover:bg-white/8"
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages || totalPages === 0}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:bg-white/8 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

// ─── CouponsPage ──────────────────────────────────────────────────────────────

export default function CouponsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [showModal, setShowModal] = useState(false);
  const [editCoupon, setEditCoupon] = useState<CouponItem | null>(null);
  const [deleteCoupon, setDeleteCoupon] = useState<CouponItem | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState<{ top?: number; bottom?: number; right: number } | null>(null);

  const { mutate: updateCoupon } = useUpdateCoupon();

  const params = {
    page,
    limit,
    ...(search ? { searchTerm: search } : {}),
    ...(statusFilter !== "all" ? { status: statusFilter as "active" | "inactive" } : {}),
  };

  const { data, isLoading, isError } = useCoupons(params);
  const coupons = data?.result ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPage ?? 1;

  const closeMenu = useCallback(() => { setOpenMenu(null); setMenuPos(null); }, []);

  const openMenuAt = (id: string, e: React.MouseEvent<HTMLButtonElement>) => {
    if (openMenu === id) { closeMenu(); return; }
    const rect = e.currentTarget.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    setMenuPos(
      spaceBelow < 120
        ? { bottom: window.innerHeight - rect.top + 4, right: window.innerWidth - rect.right }
        : { top: rect.bottom + 4, right: window.innerWidth - rect.right }
    );
    setOpenMenu(id);
  };

  const toggleStatus = (coupon: CouponItem) => {
    updateCoupon({ id: coupon._id, payload: { status: coupon.status === "active" ? "inactive" : "active" } });
    closeMenu();
  };

  const TABLE_HEADERS = [
    "Create Date","Coupon Name","Coupon Code","Discount",
    "Min. Order","Eligible Date","Expire Date","Status","Action",
  ];

  return (
    <div className="flex flex-col h-full p-6">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-white">Coupons</h1>
        <button
          onClick={() => { setEditCoupon(null); setShowModal(true); }}
          className="flex items-center gap-2 bg-white text-black px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/90 transition-colors"
        >
          <Plus size={16} />
          Add New Coupon
        </button>
      </div>

      {/* Filters */}
      <div className="shrink-0 flex items-center justify-between mb-4 gap-3">
        <div className="flex items-center gap-2.5 bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 flex-1 max-w-xs focus-within:border-white/30 transition-colors">
          <Search size={15} className="text-white/30 shrink-0" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search coupon name, code..."
            className="bg-transparent text-sm text-white placeholder-white/30 outline-none w-full"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as typeof statusFilter); setPage(1); }}
            className="appearance-none bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 pr-8 text-sm text-white outline-none cursor-pointer hover:border-white/20 transition-colors [color-scheme:dark]"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 min-h-0 bg-[#1a1a1a] rounded-2xl overflow-hidden border border-white/6">
        <div className="h-full overflow-auto" onScroll={() => openMenu && closeMenu()}>
          <table className="w-full min-w-[960px]">
            <thead className="sticky top-0 z-10 bg-[#1a1a1a]">
              <tr className="border-b border-white/6">
                {TABLE_HEADERS.map((h, i) => (
                  <th
                    key={h}
                    className={`text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider whitespace-nowrap ${
                      i === 0 ? "rounded-tl-2xl" : ""
                    } ${i === TABLE_HEADERS.length - 1 ? "rounded-tr-2xl" : ""}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              ) : isError ? (
                <tr>
                  <td colSpan={9} className="px-5 py-16 text-center text-sm text-red-400">
                    Failed to load coupons. Please try again.
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-16 text-center text-sm text-white/30">
                    {search || statusFilter !== "all"
                      ? "No coupons match your filters."
                      : "No coupons yet. Create your first coupon."}
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => (
                  <tr key={coupon._id} className="border-b border-white/4 hover:bg-white/2 transition-colors">
                    <DateCell iso={coupon.createdAt} withSeconds />
                    <td className="px-5 py-4">
                      <p className="text-sm text-white font-medium">{coupon.name}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-white/8 text-xs font-mono text-white/70 tracking-widest">
                        {coupon.code}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-white/70 whitespace-nowrap">
                      {coupon.discountMethod === "percent"
                        ? `${coupon.discountValue}%`
                        : `${coupon.discountValue.toLocaleString()} kr.`}
                    </td>
                    <td className="px-5 py-4 text-sm text-white/70 whitespace-nowrap">
                      {coupon.minimumOrder.toLocaleString()} kr.
                    </td>
                    <DateCell iso={coupon.startDate} />
                    <DateCell iso={coupon.expireDate} />
                    <td className="px-5 py-4">
                      <StatusBadge status={coupon.status} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setEditCoupon(coupon); setShowModal(true); }}
                          className="p-1.5 text-white/40 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                          title="Edit coupon"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={(e) => openMenuAt(coupon._id, e)}
                          className="p-1.5 text-white/40 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                          title="More options"
                        >
                          <MoreVertical size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {!isLoading && coupons.length > 0 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          limit={limit}
          onPageChange={setPage}
          onLimitChange={setLimit}
        />
      )}

      {/* Context menu */}
      {openMenu && menuPos && (
        <>
          <div className="fixed inset-0 z-[9998]" onClick={closeMenu} />
          <div
            className="fixed z-[9999] bg-[#1e1e1e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden w-44"
            style={{ top: menuPos.top, bottom: menuPos.bottom, right: menuPos.right }}
          >
            {(() => {
              const coupon = coupons.find((c) => c._id === openMenu);
              if (!coupon) return null;
              return (
                <>
                  <button
                    onClick={() => toggleStatus(coupon)}
                    className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-medium transition-colors ${
                      coupon.status === "active"
                        ? "text-red-400 hover:bg-red-400/8"
                        : "text-emerald-400 hover:bg-emerald-400/8"
                    }`}
                  >
                    {coupon.status === "active" ? <Ban size={16} /> : <CircleCheck size={16} />}
                    {coupon.status === "active" ? "Inactive" : "Active"}
                  </button>
                  <div className="mx-4 h-px bg-white/8" />
                  <button
                    onClick={() => { setDeleteCoupon(coupon); closeMenu(); }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-400/8 transition-colors"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </>
              );
            })()}
          </div>
        </>
      )}

      {/* Modals */}
      {showModal && (
        <CouponModal
          initialData={editCoupon ?? undefined}
          onClose={() => { setShowModal(false); setEditCoupon(null); }}
        />
      )}
      {deleteCoupon && (
        <DeleteConfirmModal coupon={deleteCoupon} onClose={() => setDeleteCoupon(null)} />
      )}
    </div>
  );
}
