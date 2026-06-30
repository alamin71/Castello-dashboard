"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Search, Pencil, MoreVertical, ChevronDown } from "lucide-react";

type Status = "active" | "inactive";

interface Offer {
  id: string;
  name: string;
  description: string;
  categories: string[];
  offerItems: number;
  price: number;
  status: Status;
  image: string;
}

const OFFERS: Offer[] = [
  { id: "OF-24001", name: '12" Home Delivery Offer', description: '12" pizza with 2 toppings, small portion of ...', categories: ["Pizzas", "Drinks", "Championship"], offerItems: 19, price: 5960, status: "active", image: "/assets/pizza.png" },
  { id: "OF-24001", name: '15" Home Delivery Offer', description: '15" pizza with 2 toppings, a large portion o...', categories: ["Pizzas", "Drinks", "Championship"], offerItems: 19, price: 6990, status: "active", image: "/assets/pizza.png" },
  { id: "OF-24001", name: '15" pizza from the menu and 15" margarita ...', description: "", categories: ["Pizzas"], offerItems: 29, price: 6890, status: "active", image: "/assets/pizza.png" },
  { id: "OF-24001", name: "Crispy Chicken Meal", description: "Choose a wrap, chips and soda included!", categories: ["Crispy Chicken", "Drinks"], offerItems: 7, price: 3090, status: "active", image: "/assets/pizza.png" },
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

export default function SpecialOfferPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [openMenu, setOpenMenu] = useState<number | null>(null);

  const filtered = OFFERS.filter((o) => {
    const matchSearch = o.name.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
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
        <h1 className="text-2xl font-semibold text-white">Offers</h1>
        <Link href="/promotions/special-offer/add" className="flex items-center gap-2 bg-white text-black px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-white/90 transition-colors">
          <Plus size={16} />
          Add New Offer
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
              <option value="pizzas">Pizzas</option>
              <option value="drinks">Drinks</option>
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
              <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">Offer Name</th>
              <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">Category</th>
              <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">Offer Items</th>
              <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">Price (Kr.)</th>
              <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">Status</th>
              <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((offer, idx) => (
              <tr key={idx} className="border-b border-white/4 hover:bg-white/2 transition-colors">
                <td className="px-5 py-4">
                  <input type="checkbox" checked={selected.has(idx)} onChange={() => toggleSelect(idx)}
                    className="w-4 h-4 rounded border border-white/20 bg-transparent accent-[#ff4d00] cursor-pointer" />
                </td>
                <td className="px-5 py-4 text-sm text-white/60">{offer.id}</td>
                <td className="px-5 py-4">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/5">
                    <Image src={offer.image} alt={offer.name} width={40} height={40} className="object-cover w-full h-full" />
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div>
                    <p className="text-sm text-white font-medium max-w-[200px] truncate">{offer.name}</p>
                    {offer.description && <p className="text-xs text-white/40 mt-0.5 max-w-[200px] truncate">{offer.description}</p>}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-1">
                    {offer.categories.map((cat) => (
                      <span key={cat} className="px-2.5 py-1 bg-white/8 border border-white/10 rounded-lg text-xs text-white/70">{cat}</span>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-white/70">{String(offer.offerItems).padStart(2, "0")}</td>
                <td className="px-5 py-4 text-sm text-white/70">{offer.price.toLocaleString()}</td>
                <td className="px-5 py-4"><StatusBadge status={offer.status} /></td>
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
