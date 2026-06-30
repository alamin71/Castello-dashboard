"use client";

import { useState } from "react";
import Link from "next/link";
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

const CATEGORIES = [
  "Pizza",
  "Kebabs",
  "Crispy Chicken",
  "Burger",
  "Championship",
  "Sauces",
  "Deserts",
  "Drinks",
];
const VARIANT_CATEGORIES = ["Inch", "Liter", "Size", "Weight"];
const VARIANT_ITEMS: Record<string, string[]> = {
  Inch: ['15"', '12"', '9"'],
  Liter: ["0.5L", "1L", "2L"],
  Size: ["S", "M", "L"],
  Weight: ["100g", "200g", "300g"],
};

const TOPPING_CATEGORIES = [
  "Meat",
  "Cheeses",
  "Vegetables",
  "Spices & Sauces",
  "Extra Grill",
];
const TOPPING_ITEMS: Record<string, string[]> = {
  Meat: ["Tuna", "Chicken", "Bacon", "Salami"],
  Cheeses: [
    "Cheese",
    "Cream cheese",
    "Pepper cheese",
    "Blue cheese",
    "Vegan Cheese",
    "Parmesan",
    "Camembert",
    "Cheddar cheese",
  ],
  Vegetables: ["Onion", "Jalapeno", "Tomato", "Bell Pepper"],
  "Spices & Sauces": ["Sauce", "Ketchup", "Mustard"],
  "Extra Grill": ["Kebab Meat", "Red Onion"],
};

interface Variant {
  category: string;
  variant: string;
  price: string;
  active: boolean;
}

type ToppingStep = "categories" | "items";

function Toggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-10 h-5 rounded-full transition-colors ${value ? "bg-[#ff4d00]" : "bg-white/20"}`}
    >
      <span
        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${value ? "left-5" : "left-0.5"}`}
      />
    </button>
  );
}

function ToppingsModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (selected: Record<string, string[]>) => void;
}) {
  const [step, setStep] = useState<ToppingStep>("categories");
  const [selectedCats, setSelectedCats] = useState<Set<string>>(new Set());
  const [selectedItems, setSelectedItems] = useState<
    Record<string, Set<string>>
  >({});
  const [activeTab, setActiveTab] = useState<string>("");

  const toggleCat = (cat: string) => {
    setSelectedCats((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) {
        next.delete(cat);
        setSelectedItems((si) => {
          const n = { ...si };
          delete n[cat];
          return n;
        });
      } else {
        next.add(cat);
        if (!activeTab) setActiveTab(cat);
      }
      return next;
    });
  };

  const toggleItem = (cat: string, item: string) => {
    setSelectedItems((prev) => {
      const catSet = new Set(prev[cat] ?? []);
      if (catSet.has(item)) catSet.delete(item);
      else catSet.add(item);
      return { ...prev, [cat]: catSet };
    });
  };

  const countForCat = (cat: string) => selectedItems[cat]?.size ?? 0;

  const tabs = [...selectedCats];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-[#1a1a1a] rounded-2xl w-full max-w-130 mx-4">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Toppings</h2>
          <button
            onClick={onClose}
            className="text-red-400 hover:text-red-300 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {step === "categories" ? (
          <div className="px-6 py-5">
            <p className="text-sm font-medium text-white mb-0.5">
              Toppings Category
            </p>
            <p className="text-xs text-white/40 mb-4">
              You can add multiple category into this product.
            </p>
            <div className="space-y-2">
              {TOPPING_CATEGORIES.map((cat) => (
                <label
                  key={cat}
                  className="flex items-center justify-between px-4 py-3 rounded-xl border border-white/10 cursor-pointer hover:border-white/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedCats.has(cat)}
                      onChange={() => toggleCat(cat)}
                      className="w-4 h-4 rounded accent-[#ff4d00]"
                    />
                    <span className="text-sm text-white">{cat}</span>
                  </div>
                  <span className="text-sm text-white/40">
                    {countForCat(cat)}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ) : (
          <div className="px-6 py-5">
            <p className="text-sm font-medium text-white mb-0.5">
              Toppings Items
            </p>
            <p className="text-xs text-white/40 mb-4">
              You can add multiple items into this product.
            </p>
            {/* Category tabs */}
            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
              <button className="p-1 text-white/40 hover:text-white shrink-0">
                <ChevronLeft size={14} />
              </button>
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap border transition-colors ${
                    activeTab === tab
                      ? "border-[#ff4d00] text-[#ff4d00]"
                      : "border-white/15 text-white/50 hover:text-white"
                  }`}
                >
                  {tab} <span className="font-medium">{countForCat(tab)}</span>
                </button>
              ))}
              <button className="p-1 text-white/40 hover:text-white shrink-0">
                <ChevronRight size={14} />
              </button>
            </div>
            {/* Items grid */}
            {activeTab && (
              <div className="grid grid-cols-2 gap-2">
                {(TOPPING_ITEMS[activeTab] ?? []).map((item) => (
                  <label
                    key={item}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedItems[activeTab]?.has(item) ?? false}
                      onChange={() => toggleItem(activeTab, item)}
                      className="w-4 h-4 rounded accent-[#ff4d00]"
                    />
                    <span className="text-sm text-white">{item}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="px-6 pb-6 pt-2 border-t border-white/10">
          <div className="flex gap-3 mt-4">
            {step === "categories" ? (
              <>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl border border-white/15 text-white text-sm font-medium hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (selectedCats.size > 0) {
                      setActiveTab([...selectedCats][0]);
                      setStep("items");
                    }
                  }}
                  className="flex-1 py-3 rounded-xl bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors"
                >
                  Save & Next
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setStep("categories")}
                  className="flex-1 py-3 rounded-xl border border-white/15 text-white text-sm font-medium hover:bg-white/5 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    const result: Record<string, string[]> = {};
                    for (const [cat, items] of Object.entries(selectedItems))
                      result[cat] = [...items];
                    onSave(result);
                    onClose();
                  }}
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

export default function AddProductPage() {
  const [productType, setProductType] = useState<"single" | "variant">(
    "single",
  );
  const [variants, setVariants] = useState<Variant[]>([
    { category: "", variant: "", price: "", active: true },
  ]);
  const [showToppingsModal, setShowToppingsModal] = useState(false);
  const [savedToppings, setSavedToppings] = useState<Record<string, string[]>>(
    {},
  );
  const [availability, setAvailability] = useState({
    Website: true,
    POS: false,
    KIOSK: true,
  });

  const addVariant = () =>
    setVariants((prev) => [
      ...prev,
      { category: "", variant: "", price: "", active: true },
    ]);
  const removeVariant = (idx: number) =>
    setVariants((prev) => prev.filter((_, i) => i !== idx));

  const updateVariant = (
    idx: number,
    field: keyof Variant,
    value: string | boolean,
  ) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === idx ? { ...v, [field]: value } : v)),
    );
  };

  const toppingSummary =
    Object.keys(savedToppings).length > 0
      ? Object.entries(savedToppings)
          .map(([cat, items]) => `${cat} (${items.length})`)
          .join(", ")
      : "";

  const ordinalSuffix = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  return (
    <div className="p-6 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/menu/products"
          className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
        >
          <ChevronLeft size={18} />
        </Link>
        <h1 className="text-2xl font-semibold text-white">Add New Product</h1>
      </div>

      <div className="flex gap-6">
        {/* Left - Main Form */}
        <div className="flex-1 space-y-5">
          {/* Product Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white">
              <span className="text-red-400">*</span>Product Name
            </label>
            <input
              type="text"
              placeholder="Enter product name"
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-white/30 transition-colors"
            />
          </div>

          {/* Product Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white">
              Product Description
            </label>
            <textarea
              placeholder="Write product description"
              rows={4}
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-white/30 transition-colors resize-none"
            />
          </div>

          {/* Category + Toppings */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white">
                <span className="text-red-400">*</span>Category
              </label>
              <div className="relative">
                <select className="appearance-none w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none cursor-pointer focus:border-white/20 scheme-dark">
                  <option value="">Select a category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white">Toppings</label>
              <button
                onClick={() => setShowToppingsModal(true)}
                className="flex items-center justify-between w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none hover:border-white/20 transition-colors"
              >
                <span
                  className={
                    toppingSummary
                      ? "text-white text-xs truncate"
                      : "text-white/30"
                  }
                >
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
                    productType === type
                      ? "border-[#ff4d00]"
                      : "border-white/30"
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
                <span className="text-red-400">*</span>Price
              </label>
              <input
                type="number"
                placeholder="Enter product price"
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-white/30 transition-colors"
              />
            </div>
          )}

          {/* Variant Item */}
          {productType === "variant" && (
            <div className="space-y-3">
              {variants.map((v, idx) => (
                <div key={idx} className="space-y-1.5">
                  <p className="text-sm text-white/60">
                    {ordinalSuffix(idx + 1)} Variant
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <select
                        value={v.category}
                        onChange={(e) =>
                          updateVariant(idx, "category", e.target.value)
                        }
                        className="appearance-none w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none cursor-pointer focus:border-white/20 scheme-dark"
                      >
                        <option value="">Select Category</option>
                        {VARIANT_CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={14}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
                      />
                    </div>
                    <div className="relative flex-1">
                      <select
                        value={v.variant}
                        onChange={(e) =>
                          updateVariant(idx, "variant", e.target.value)
                        }
                        className="appearance-none w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none cursor-pointer focus:border-white/20 scheme-dark"
                      >
                        <option value="">Select Variant</option>
                        {(VARIANT_ITEMS[v.category] ?? []).map((i) => (
                          <option key={i} value={i}>
                            {i}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={14}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
                      />
                    </div>
                    <input
                      type="number"
                      placeholder="Enter item price"
                      value={v.price}
                      onChange={(e) =>
                        updateVariant(idx, "price", e.target.value)
                      }
                      className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-white/30"
                    />
                    <button
                      onClick={() => removeVariant(idx)}
                      className="text-white/30 hover:text-white transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <Toggle
                      value={v.active}
                      onChange={(val) => updateVariant(idx, "active", val)}
                    />
                  </div>
                </div>
              ))}
              <button
                onClick={addVariant}
                className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors mt-2"
              >
                <Plus size={15} /> Add More Variant
              </button>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-center pt-4">
            <button className="px-10 py-3 bg-white text-black text-sm font-medium rounded-xl hover:bg-white/90 transition-colors">
              Save Product
            </button>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-65 shrink-0 space-y-5">
          {/* Main Image */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white">
              <span className="text-red-400">*</span>Main Image
            </label>
            <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 text-center cursor-pointer hover:border-white/20 transition-colors">
              <CloudUpload size={28} className="mx-auto text-white/30 mb-2" />
              <p className="text-sm text-white/40">Upload an image</p>
              <p className="text-xs text-white/25 mt-1">
                Webp, JPEG, PNG Â· 220*220 px
              </p>
            </div>
          </div>

          {/* Image Gallery */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white">
              Image Gallery
            </label>
            <div className="bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3.5 flex items-center gap-3 cursor-pointer hover:border-white/20 transition-colors">
              <CloudUpload size={22} className="text-white/30 shrink-0" />
              <div>
                <p className="text-sm text-white/40">Upload multiple image</p>
                <p className="text-xs text-white/25 mt-0.5">
                  Webp, JPEG, PNG Â· 220*220 px
                </p>
              </div>
            </div>
          </div>

          {/* Availability */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">
              Availability
            </label>
            {(
              [
                { label: "Website" as const, Icon: Monitor },
                { label: "POS" as const, Icon: Printer },
                { label: "KIOSK" as const, Icon: Tablet },
              ] as const
            ).map(({ label, Icon }) => (
              <div
                key={label}
                className="flex items-center justify-between bg-[#1a1a1a] border border-white/10 rounded-xl p-4"
              >
                <div className="flex items-center gap-3">
                  <Icon size={15} className="text-white/50" />
                  <span className="text-sm text-white">{label}</span>
                </div>
                <Toggle
                  value={availability[label]}
                  onChange={(v) =>
                    setAvailability((prev) => ({ ...prev, [label]: v }))
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {showToppingsModal && (
        <ToppingsModal
          onClose={() => setShowToppingsModal(false)}
          onSave={(selected) => setSavedToppings(selected)}
        />
      )}
    </div>
  );
}
