"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CloudUpload, Plus, X, ChevronLeft, ChevronRight, Search } from "lucide-react";

const PRODUCT_CATEGORIES = ["Pizza", "Kebabs", "Crispy Chicken", "Burger", "Championship", "Deserts", "Sauces", "Drinks"];

const CATEGORY_PRODUCTS: Record<string, { name: string; description: string; variants: { size: string; price: number }[]; image: string }[]> = {
  Pizza: [
    { name: "Kebab Pizza", description: "Pepperoni, Bacon, Paprika, Garlic Sauc...", variants: [{ size: '15"', price: 3950 }, { size: '12"', price: 3950 }, { size: '9"', price: 3950 }], image: "/assets/pizza.png" },
    { name: "Mexican Pizza", description: "Pepperoni, Bacon, Paprika, Garlic Sauc...", variants: [{ size: '15"', price: 3950 }, { size: '12"', price: 3950 }, { size: '9"', price: 3950 }], image: "/assets/pizza.png" },
    { name: "Classic", description: "Pepperoni, Bacon, Paprika, Garlic Sauc...", variants: [{ size: '15"', price: 3950 }, { size: '12"', price: 3950 }, { size: '9"', price: 3950 }], image: "/assets/pizza.png" },
    { name: "The front page pizza", description: "Pepperoni, Bacon, Paprika, Garlic Sauc...", variants: [{ size: '15"', price: 3950 }, { size: '12"', price: 3950 }, { size: '9"', price: 3950 }], image: "/assets/pizza.png" },
  ],
  Drinks: [
    { name: "Top Lemon", description: "", variants: [{ size: "0.33L", price: 580 }], image: "/assets/pizza.png" },
    { name: "Coke", description: "", variants: [{ size: "0.33L", price: 390 }, { size: "0.5L", price: 440 }, { size: "2L", price: 580 }], image: "/assets/pizza.png" },
    { name: "Minute Maid Apple", description: "", variants: [{ size: "0.33L", price: 350 }], image: "/assets/pizza.png" },
    { name: "Fanta", description: "", variants: [{ size: "0.33L", price: 580 }], image: "/assets/pizza.png" },
  ],
};

type OfferModalStep = "categories" | "products";

interface OfferItem {
  label: string;
  count: number;
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} className={`relative w-10 h-5 rounded-full transition-colors ${value ? "bg-[#ff4d00]" : "bg-white/20"}`}>
      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${value ? "left-5" : "left-0.5"}`} />
    </button>
  );
}

function OfferProductsModal({ onClose, onSave }: { onClose: () => void; onSave: (label: string, count: number) => void }) {
  const [step, setStep] = useState<OfferModalStep>("categories");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedVariants, setSelectedVariants] = useState<Set<string>>(new Set());
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [productSearch, setProductSearch] = useState("");

  const products = CATEGORY_PRODUCTS[selectedCategory] ?? [];

  const allVariantSizes = [...new Set(products.flatMap((p) => p.variants.map((v) => v.size)))];

  const toggleVariant = (size: string) => {
    setSelectedVariants((prev) => {
      const next = new Set(prev);
      if (next.has(size)) next.delete(size); else next.add(size);
      return next;
    });
  };

  const toggleProduct = (name: string) => {
    setSelectedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  };

  const toggleAllVariants = () => {
    if (selectedVariants.size === allVariantSizes.length) setSelectedVariants(new Set());
    else setSelectedVariants(new Set(allVariantSizes));
  };

  const toggleAllProducts = () => {
    const names = products.map((p) => p.name);
    if (selectedProducts.size === names.length) setSelectedProducts(new Set());
    else setSelectedProducts(new Set(names));
  };

  const filteredProducts = products.filter((p) => p.name.toLowerCase().includes(productSearch.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-[#1a1a1a] rounded-2xl w-full max-w-130 mx-4 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/10 shrink-0">
          <h2 className="text-lg font-semibold text-white">Offer Products</h2>
          <button onClick={onClose} className="text-red-400 hover:text-red-300 transition-colors"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {step === "categories" ? (
            <>
              <p className="text-sm font-medium text-white mb-0.5">Product Category</p>
              <p className="text-xs text-white/40 mb-4">You can add multiple category into this offer.</p>
              <div className="space-y-2">
                {PRODUCT_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => { setSelectedCategory(cat); setStep("products"); setSelectedVariants(new Set()); setSelectedProducts(new Set()); }}
                    className="flex items-center justify-between w-full px-4 py-3 rounded-xl border border-white/10 hover:border-white/20 transition-colors"
                  >
                    <span className="text-sm text-white">{cat}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white/40">0</span>
                      <ChevronRight size={14} className="text-white/40" />
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Variant selector */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-white"><span className="text-red-400">*</span>Choose Product Variant</p>
                  <button onClick={toggleAllVariants} className="text-xs text-white/50 hover:text-white transition-colors">
                    {selectedVariants.size === allVariantSizes.length ? "Deselect all" : "Select all"}
                  </button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {allVariantSizes.map((size) => (
                    <label key={size} className={`flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer transition-colors ${selectedVariants.has(size) ? "border-[#ff4d00] bg-[#ff4d00]/10" : "border-white/15 hover:border-white/25"}`}>
                      <input type="checkbox" checked={selectedVariants.has(size)} onChange={() => toggleVariant(size)} className="w-4 h-4 rounded accent-[#ff4d00]" />
                      <span className="text-sm text-white">{size}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Product selector */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-white">Choose product</p>
                    <p className="text-xs text-white/40">You can add multiple products into this offer.</p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={selectedProducts.size === products.length && products.length > 0} onChange={toggleAllProducts} className="w-4 h-4 rounded accent-[#ff4d00]" />
                    <span className="text-xs text-white/50">Select all</span>
                  </label>
                </div>
                <div className="flex items-center gap-2 bg-[#0f0f0f] border border-white/10 rounded-xl px-4 py-2.5 mb-3">
                  <Search size={14} className="text-white/30 shrink-0" />
                  <input value={productSearch} onChange={(e) => setProductSearch(e.target.value)} placeholder="Search product name to add"
                    className="bg-transparent text-sm text-white placeholder-white/30 outline-none w-full" />
                </div>
                <div className="space-y-3">
                  {filteredProducts.map((product) => (
                    <div key={product.name} className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${selectedProducts.has(product.name) ? "border-white/20 bg-white/5" : "border-white/10"}`}>
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-white/5 shrink-0">
                        <Image src={product.image} alt={product.name} width={56} height={56} className="object-cover w-full h-full" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium">{product.name}</p>
                        {product.description && <p className="text-xs text-white/40 mb-2">{product.description}</p>}
                        {product.variants.length > 1 && (
                          <div>
                            <p className="text-xs text-white/40 mb-1">Choose Variant</p>
                            <div className="flex gap-2 flex-wrap">
                              {product.variants.map((v) => (
                                <span key={v.size} className={`px-2.5 py-1 rounded-lg text-xs border transition-colors ${selectedVariants.has(v.size) ? "border-[#ff4d00] text-white" : "border-white/15 text-white/50"}`}>
                                  {v.size} {v.price.toLocaleString()} kr.
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {product.variants.length === 1 && (
                          <span className="text-xs text-white/60">{product.variants[0].price.toLocaleString()} kr.</span>
                        )}
                      </div>
                      <input type="checkbox" checked={selectedProducts.has(product.name)} onChange={() => toggleProduct(product.name)}
                        className="w-4 h-4 rounded accent-[#ff4d00] mt-1 shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="px-6 pb-6 pt-2 border-t border-white/10 shrink-0">
          <div className="flex gap-3 mt-4">
            {step === "categories" ? (
              <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/15 text-white text-sm font-medium hover:bg-white/5 transition-colors">Cancel</button>
            ) : (
              <button onClick={() => setStep("categories")} className="flex-1 py-3 rounded-xl border border-white/15 text-white text-sm font-medium hover:bg-white/5 transition-colors">Back</button>
            )}
            <button
              onClick={() => {
                if (step === "categories") return;
                onSave(`${selectedCategory}  ${selectedProducts.size} product${selectedProducts.size !== 1 ? "s" : ""}`, selectedProducts.size);
                onClose();
              }}
              className="flex-1 py-3 rounded-xl bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors"
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
  const [offerItems, setOfferItems] = useState<OfferItem[]>([{ label: "", count: 0 }]);
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [activeItemIdx, setActiveItemIdx] = useState(0);
  const [homeDelivery, setHomeDelivery] = useState(true);
  const [takeAway, setTakeAway] = useState(false);
  const [websiteAvail, setWebsiteAvail] = useState(true);
  const [posAvail, setPosAvail] = useState(false);
  const [kioskAvail, setKioskAvail] = useState(true);

  const openProductsModal = (idx: number) => {
    setActiveItemIdx(idx);
    setShowProductsModal(true);
  };

  const handleSaveProducts = (label: string, count: number) => {
    setOfferItems((prev) => prev.map((item, i) => i === activeItemIdx ? { label, count } : item));
  };

  const addMoreItem = () => setOfferItems((prev) => [...prev, { label: "", count: 0 }]);

  return (
    <div className="p-6 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/promotions/special-offer" className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors">
          <ChevronLeft size={18} />
        </Link>
        <h1 className="text-2xl font-semibold text-white">Create New Offer</h1>
      </div>

      <div className="flex gap-6">
        {/* Left - Main Form */}
        <div className="flex-1 space-y-5">
          {/* Offer Title */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white"><span className="text-red-400">*</span>Offer Title</label>
            <input type="text" placeholder="Enter offer title"
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-white/30 transition-colors" />
          </div>

          {/* Offer Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white">Offer Description</label>
            <textarea placeholder="Write offer description" rows={4}
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-white/30 transition-colors resize-none" />
          </div>

          {/* Price */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white"><span className="text-red-400">*</span>Price</label>
            <input type="number" placeholder="Enter offer price"
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-white/30 transition-colors" />
          </div>

          {/* Offer Products */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white"><span className="text-red-400">*</span>Offer Products</label>
            {offerItems.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <p className="text-xs text-white/40">Item {idx + 1}</p>
                <button
                  onClick={() => openProductsModal(idx)}
                  className="flex items-center justify-between w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none hover:border-white/20 transition-colors"
                >
                  <span className={item.label ? "text-white" : "text-white/30"}>
                    {item.label || "Choose products"}
                  </span>
                  <ChevronRight size={14} className="text-white/40" />
                </button>
              </div>
            ))}
            <button onClick={addMoreItem} className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors">
              <Plus size={15} /> Add More Item
            </button>
          </div>

          {/* Offer Available for */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white"><span className="text-red-400">*</span>Offer Available for</label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`flex items-center justify-between px-4 py-3.5 rounded-xl border cursor-pointer transition-colors ${homeDelivery ? "border-[#ff4d00] bg-[#ff4d00]/5" : "border-white/10 hover:border-white/20"}`}>
                <div className="flex items-center gap-2">
                  <span className="text-base">ðŸ›µ</span>
                  <span className="text-sm text-white">Home Delivery</span>
                </div>
                <input type="checkbox" checked={homeDelivery} onChange={(e) => setHomeDelivery(e.target.checked)} className="w-4 h-4 rounded accent-[#ff4d00]" />
              </label>
              <label className={`flex items-center justify-between px-4 py-3.5 rounded-xl border cursor-pointer transition-colors ${takeAway ? "border-[#ff4d00] bg-[#ff4d00]/5" : "border-white/10 hover:border-white/20"}`}>
                <div className="flex items-center gap-2">
                  <span className="text-base">ðŸ›</span>
                  <span className="text-sm text-white">Take Away</span>
                </div>
                <input type="checkbox" checked={takeAway} onChange={(e) => setTakeAway(e.target.checked)} className="w-4 h-4 rounded accent-[#ff4d00]" />
              </label>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-center pt-4">
            <button className="px-10 py-3 bg-white text-black text-sm font-medium rounded-xl hover:bg-white/90 transition-colors">
              Save Offer
            </button>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-65 shrink-0 space-y-5">
          {/* Main Image */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white"><span className="text-red-400">*</span>Main Image</label>
            <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 text-center cursor-pointer hover:border-white/20 transition-colors">
              <CloudUpload size={28} className="mx-auto text-white/30 mb-2" />
              <p className="text-sm text-white/40">Upload an image</p>
              <p className="text-xs text-white/25 mt-1">Webp, JPEG, PNG Â· 220*220 px</p>
            </div>
          </div>

          {/* Image Gallery */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white">Image Gallery</label>
            <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5 text-center cursor-pointer hover:border-white/20 transition-colors">
              <CloudUpload size={24} className="mx-auto text-white/30 mb-2" />
              <p className="text-sm text-white/40">Upload multiple image</p>
              <p className="text-xs text-white/25 mt-1">Webp, JPEG, PNG Â· 220*220 px</p>
            </div>
          </div>

          {/* Availability */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Availability</label>
            <div className="flex items-center justify-between bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2"><span className="text-sm">ðŸ–¥</span><span className="text-sm text-white">Website</span></div>
              <Toggle value={websiteAvail} onChange={setWebsiteAvail} />
            </div>
            <div className="flex items-center justify-between bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2"><span className="text-sm">ðŸ–¨</span><span className="text-sm text-white">POS</span></div>
              <Toggle value={posAvail} onChange={setPosAvail} />
            </div>
            <div className="flex items-center justify-between bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2"><span className="text-sm">ðŸ“±</span><span className="text-sm text-white">KIOSK</span></div>
              <Toggle value={kioskAvail} onChange={setKioskAvail} />
            </div>
          </div>
        </div>
      </div>

      {showProductsModal && (
        <OfferProductsModal
          onClose={() => setShowProductsModal(false)}
          onSave={handleSaveProducts}
        />
      )}
    </div>
  );
}
