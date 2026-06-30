"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Search, Pencil, MoreVertical, ChevronDown } from "lucide-react";

type Status = "active" | "inactive";

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  prices: { size: string; price: number }[];
  status: Status;
  image: string;
}

const CATEGORY_IMAGE: Record<string, string> = {
  Pizza: "/assets/pizza.png",
  Kebabs: "/icons/kebab.svg",
  "Crispy Chicken": "/icons/chicken.svg",
  Burger: "/icons/bowl.svg",
  Companionship: "/icons/bowl.svg",
  Championship: "/icons/bowl.svg",
  Sauces: "/icons/bowl.svg",
  Deserts: "/icons/bowl.svg",
  Drinks: "/icons/bowl.svg",
};

const PRODUCTS: Product[] = [
  { id: "CP-24652", name: "Hawaiian", description: "Ham, pineapple", category: "Pizza", prices: [{ size: '15"', price: 4750 }, { size: '9"', price: 4750 }], status: "active", image: CATEGORY_IMAGE.Pizza },
  { id: "CP-24652", name: "Margarita", description: "Sauce and cheese", category: "Pizza", prices: [{ size: '15"', price: 4750 }, { size: '9"', price: 4750 }], status: "active", image: CATEGORY_IMAGE.Pizza },
  { id: "CP-24652", name: "Pacific", description: "Shrimp, Onion, Chili Flakes, Garlic, Pineapple, Oregano, Black Oli...", category: "Pizza", prices: [{ size: '15"', price: 4750 }, { size: '9"', price: 4750 }], status: "inactive", image: CATEGORY_IMAGE.Pizza },
  { id: "CP-24652", name: "The front page pizza", description: "Pepperoni, Bacon, Paprika, Garlic Sauce, Basil, Jalapeno", category: "Pizza", prices: [{ size: '15"', price: 4750 }, { size: '9"', price: 4750 }], status: "active", image: CATEGORY_IMAGE.Pizza },
  { id: "CP-24652", name: "Durum Kebab w/chicken", description: "", category: "Kebabs", prices: [{ size: '15"', price: 4750 }, { size: '9"', price: 4750 }], status: "active", image: CATEGORY_IMAGE.Kebabs },
  { id: "CP-24652", name: "Parma burger", description: "Bacon, cabbage, cucumber, red onion, arugula, parmesan and ha...", category: "Burger", prices: [{ size: '15"', price: 4750 }, { size: '9"', price: 4750 }], status: "active", image: CATEGORY_IMAGE.Burger },
  { id: "CP-24652", name: "Spiced bread pizza", description: "Ham, pineapple", category: "Companionship", prices: [{ size: '15"', price: 4750 }, { size: '9"', price: 4750 }], status: "active", image: CATEGORY_IMAGE.Companionship },
  { id: "CP-24652", name: "Cheese sticks", description: "", category: "Companionship", prices: [{ size: '15"', price: 4750 }, { size: '9"', price: 4750 }], status: "active", image: CATEGORY_IMAGE.Companionship },
];

function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border ${
      status === "active" ? "border-emerald-500 text-emerald-400" : "border-red-500 text-red-400"
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === "active" ? "bg-emerald-400" : "bg-red-400"}`} />
      {status === "active" ? "Active" : "Inactive"}
    </span>
  );
}

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [openMenu, setOpenMenu] = useState<number | null>(null);

  const categories = [...new Set(PRODUCTS.map((p) => p.category))];

  const filtered = PRODUCTS.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "all" || p.category === categoryFilter;
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchCat && matchStatus;
  });

  const toggleSelect = (idx: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  };

  const allSelected = filtered.length > 0 && filtered.every((_, i) => selected.has(i));
  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(filtered.map((_, i) => i)));
  };

  return (
    <div className="p-6 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-white">Products</h1>
        <Link href="/menu/products/add" className="flex items-center gap-2 bg-white text-black px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-white/90 transition-colors">
          <Plus size={16} />
          Add New Product
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 w-72">
          <Search size={16} className="text-white/30 shrink-0" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search product id, name..."
            className="bg-transparent text-sm text-white placeholder-white/30 outline-none w-full" />
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
              className="appearance-none bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none cursor-pointer focus:border-white/20 [color-scheme:dark]">
              <option value="all">All Category</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
          </div>
          <div className="relative">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as "all" | Status)}
              className="appearance-none bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none cursor-pointer focus:border-white/20 [color-scheme:dark]">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#1a1a1a] rounded-2xl overflow-hidden border border-white/6">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/6">
              <th className="px-5 py-4 w-10">
                <input type="checkbox" checked={allSelected} onChange={toggleAll}
                  className="w-4 h-4 rounded border border-white/20 bg-transparent accent-[#ff4d00] cursor-pointer" />
              </th>
              <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">Product ID</th>
              <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">Photo</th>
              <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">Product Name</th>
              <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">Category</th>
              <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">Price (Kr.)</th>
              <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">Status</th>
              <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((product, idx) => (
              <tr key={idx} className="border-b border-white/4 hover:bg-white/2 transition-colors">
                <td className="px-5 py-4">
                  <input type="checkbox" checked={selected.has(idx)} onChange={() => toggleSelect(idx)}
                    className="w-4 h-4 rounded border border-white/20 bg-transparent accent-[#ff4d00] cursor-pointer" />
                </td>
                <td className="px-5 py-4 text-sm text-white/60">{product.id}</td>
                <td className="px-5 py-4">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/5 flex items-center justify-center">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={40}
                      height={40}
                      className={`w-full h-full ${product.image.endsWith(".svg") ? "object-contain p-1.5" : "object-cover"}`}
                    />
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div>
                    <p className="text-sm text-white font-medium">{product.name}</p>
                    {product.description && <p className="text-xs text-white/40 mt-0.5 max-w-60 truncate">{product.description}</p>}
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-white/70">{product.category}</td>
                <td className="px-5 py-4">
                  <div className="space-y-0.5">
                    {product.prices.map((p) => (
                      <div key={p.size} className="text-xs text-white/60">
                        <span className="text-white/40">{p.size}</span> {p.price.toLocaleString()}
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-4"><StatusBadge status={product.status} /></td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1 relative">
                    <button className="p-1.5 text-white/40 hover:text-white transition-colors rounded-lg hover:bg-white/5"><Pencil size={15} /></button>
                    <button onClick={() => setOpenMenu(openMenu === idx ? null : idx)} className="p-1.5 text-white/40 hover:text-white transition-colors rounded-lg hover:bg-white/5"><MoreVertical size={15} /></button>
                    {openMenu === idx && (
                      <div className="absolute right-0 top-8 z-20 bg-[#232323] border border-white/10 rounded-xl shadow-xl min-w-32.5 py-1">
                        <button className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-white/5 transition-colors">
                          <span className="w-4 h-4 rounded-full border-2 border-red-400" /> Inactive
                        </button>
                        <button className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-white/5 transition-colors">
                          <span>ðŸ—‘</span> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-5">
        <div className="flex items-center gap-2 text-sm text-white/40">
          <span>Showing per page</span>
          <div className="relative">
            <select className="appearance-none bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-1.5 pr-7 text-sm text-white outline-none">
              <option>20</option><option>50</option>
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
          </div>
        </div>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((p) => (
            <button key={p} className={`w-8 h-8 rounded-lg text-sm transition-colors ${p === 1 ? "bg-white text-black font-medium" : "text-white/50 hover:text-white hover:bg-white/5"}`}>
              {String(p).padStart(2, "0")}
            </button>
          ))}
          <span className="text-white/30 px-1">...</span>
          <button className="w-8 h-8 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/5">17</button>
        </div>
      </div>

      {openMenu !== null && <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />}
    </div>
  );
}
