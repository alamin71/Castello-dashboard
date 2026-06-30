"use client";

import { useState } from "react";
import { Plus, Search, Pencil, MoreVertical, X, ChevronDown } from "lucide-react";

type Status = "active" | "inactive";
type Tab = "categories" | "items";

interface ToppingCategory {
  id: string;
  name: string;
  assignedItems: number;
  status: Status;
}

interface ToppingItem {
  id: string;
  name: string;
  category: string;
  pricePerItem: number;
  status: Status;
}

const TOPPING_CATEGORIES: ToppingCategory[] = [
  { id: "TC-34611", name: "Meat", assignedItems: 19, status: "active" },
  { id: "TC-34611", name: "Vegetables", assignedItems: 13, status: "active" },
  { id: "TC-34611", name: "Cheeses", assignedItems: 7, status: "inactive" },
  { id: "TC-34611", name: "Spices & Sauces", assignedItems: 27, status: "active" },
  { id: "TC-34611", name: "Extra grill", assignedItems: 0, status: "active" },
];

const TOPPING_ITEMS: ToppingItem[] = [
  { id: "TI-34611", name: "Tuna", category: "Meat", pricePerItem: 420, status: "active" },
  { id: "TI-34611", name: "Cheese", category: "Cheeses", pricePerItem: 420, status: "active" },
  { id: "TI-34611", name: "Cream Cheese", category: "Cheeses", pricePerItem: 420, status: "active" },
  { id: "TI-34611", name: "Blue Cheese", category: "Cheeses", pricePerItem: 420, status: "active" },
  { id: "TI-34611", name: "Chicken", category: "Meat", pricePerItem: 420, status: "active" },
  { id: "TI-34611", name: "Onion", category: "Vegetables", pricePerItem: 420, status: "active" },
  { id: "TI-34611", name: "Jalapeno", category: "Vegetables", pricePerItem: 420, status: "active" },
  { id: "TI-34611", name: "Sauce", category: "Spices & Sauces", pricePerItem: 420, status: "active" },
  { id: "TI-34611", name: "Kebab Meat", category: "Extra Grill", pricePerItem: 420, status: "active" },
  { id: "TI-34611", name: "Red Onion", category: "Extra Grill", pricePerItem: 420, status: "active" },
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

function AddCategoryModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-[#1a1a1a] rounded-2xl w-full max-w-[500px] mx-4">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Add New Category</h2>
          <button onClick={onClose} className="text-red-400 hover:text-red-300 transition-colors"><X size={20} /></button>
        </div>
        <div className="px-6 py-5 space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white"><span className="text-red-400">*</span>Toppings Category</label>
            <input type="text" placeholder="Enter category name" className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-white/30" />
          </div>
        </div>
        <div className="px-6 pb-6 pt-2 border-t border-white/10">
          <div className="flex gap-3 mt-4">
            <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/15 text-white text-sm font-medium hover:bg-white/5 transition-colors">Cancel</button>
            <button className="flex-1 py-3 rounded-xl bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors">Save Category</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddItemModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-[#1a1a1a] rounded-2xl w-full max-w-[500px] mx-4">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Add New Item</h2>
          <button onClick={onClose} className="text-red-400 hover:text-red-300 transition-colors"><X size={20} /></button>
        </div>
        <div className="px-6 py-5 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white"><span className="text-red-400">*</span>Item Name</label>
              <input type="text" placeholder="Enter item name" className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-white/30" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white"><span className="text-red-400">*</span>Price</label>
              <input type="number" placeholder="Enter item price" className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-white/30" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white"><span className="text-red-400">*</span>Toppings Category</label>
            <div className="relative">
              <select className="appearance-none w-full bg-[#0f0f0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white/50 outline-none">
                <option value="">Select toppings category</option>
                {TOPPING_CATEGORIES.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
            </div>
          </div>
        </div>
        <div className="px-6 pb-6 pt-2 border-t border-white/10">
          <div className="flex gap-3 mt-4">
            <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/15 text-white text-sm font-medium hover:bg-white/5 transition-colors">Cancel</button>
            <button className="flex-1 py-3 rounded-xl bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors">Save Item</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ToppingsPage() {
  const [tab, setTab] = useState<Tab>("categories");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [categories, setCategories] = useState(TOPPING_CATEGORIES);
  const [items, setItems] = useState(TOPPING_ITEMS);

  const filteredCats = categories.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    return matchSearch && (statusFilter === "all" || c.status === statusFilter);
  });

  const filteredItems = items.filter((i) => {
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase());
    return matchSearch && (statusFilter === "all" || i.status === statusFilter) && (categoryFilter === "all" || i.category === categoryFilter);
  });

  const toggleCatStatus = (idx: number) => {
    setCategories((prev) => prev.map((c, i) => i === idx ? { ...c, status: c.status === "active" ? "inactive" : "active" } : c));
    setOpenMenu(null);
  };

  const toggleItemStatus = (idx: number) => {
    setItems((prev) => prev.map((c, i) => i === idx ? { ...c, status: c.status === "active" ? "inactive" : "active" } : c));
    setOpenMenu(null);
  };

  return (
    <div className="p-6 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-white">Toppings</h1>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-white text-black px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-white/90 transition-colors">
          <Plus size={16} />
          {tab === "categories" ? "Add New Category" : "Add New Item"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {(["categories", "items"] as Tab[]).map((t) => (
          <button key={t} onClick={() => { setTab(t); setSearch(""); setOpenMenu(null); }}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${tab === t ? "bg-white text-black" : "bg-[#1a1a1a] text-white/60 hover:text-white border border-white/10"}`}>
            {t === "categories" ? "Toppings Categories" : "Toppings Items"}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 w-72">
          <Search size={16} className="text-white/30 shrink-0" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search category id, name..."
            className="bg-transparent text-sm text-white placeholder-white/30 outline-none w-full" />
        </div>
        <div className="flex items-center gap-2">
          {tab === "items" && (
            <div className="relative">
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
                className="appearance-none bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none cursor-pointer focus:border-white/20 [color-scheme:dark]">
                <option value="all">All Category</option>
                {TOPPING_CATEGORIES.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
            </div>
          )}
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
              {tab === "categories" ? (
                <>
                  <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">Category ID</th>
                  <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">Topping Category</th>
                  <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">Assigned Items</th>
                  <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">Action</th>
                </>
              ) : (
                <>
                  <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">Item ID</th>
                  <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">Topping Item</th>
                  <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">Topping Category</th>
                  <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">Price Per Item (Kr.)</th>
                  <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">Action</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {tab === "categories"
              ? filteredCats.map((cat, idx) => (
                  <tr key={idx} className="border-b border-white/4 hover:bg-white/2 transition-colors">
                    <td className="px-5 py-4 text-sm text-white/60">{cat.id}</td>
                    <td className="px-5 py-4 text-sm text-white font-medium">{cat.name}</td>
                    <td className="px-5 py-4 text-sm text-white/70">{String(cat.assignedItems).padStart(2, "0")}</td>
                    <td className="px-5 py-4"><StatusBadge status={cat.status} /></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 relative">
                        <button className="p-1.5 text-white/40 hover:text-white transition-colors rounded-lg hover:bg-white/5"><Pencil size={15} /></button>
                        <button onClick={() => setOpenMenu(openMenu === idx ? null : idx)} className="p-1.5 text-white/40 hover:text-white transition-colors rounded-lg hover:bg-white/5"><MoreVertical size={15} /></button>
                        {openMenu === idx && (
                          <div className="absolute right-0 top-8 z-20 bg-[#232323] border border-white/10 rounded-xl shadow-xl min-w-32.5 py-1">
                            <button onClick={() => toggleCatStatus(idx)} className={`flex items-center gap-2 w-full px-4 py-2.5 text-sm ${cat.status === "active" ? "text-red-400" : "text-emerald-400"} hover:bg-white/5`}>
                              <span className={`w-4 h-4 rounded-full border-2 ${cat.status === "active" ? "border-red-400" : "border-emerald-400"}`} />
                              {cat.status === "active" ? "Inactive" : "Active"}
                            </button>
                            <button className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-white/5"><span>ðŸ—‘</span> Delete</button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              : filteredItems.map((item, idx) => (
                  <tr key={idx} className="border-b border-white/4 hover:bg-white/2 transition-colors">
                    <td className="px-5 py-4 text-sm text-white/60">{item.id}</td>
                    <td className="px-5 py-4 text-sm text-white font-medium">{item.name}</td>
                    <td className="px-5 py-4 text-sm text-white/70">{item.category}</td>
                    <td className="px-5 py-4 text-sm text-white/70">{item.pricePerItem}</td>
                    <td className="px-5 py-4"><StatusBadge status={item.status} /></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 relative">
                        <button className="p-1.5 text-white/40 hover:text-white transition-colors rounded-lg hover:bg-white/5"><Pencil size={15} /></button>
                        <button onClick={() => setOpenMenu(openMenu === idx ? null : idx)} className="p-1.5 text-white/40 hover:text-white transition-colors rounded-lg hover:bg-white/5"><MoreVertical size={15} /></button>
                        {openMenu === idx && (
                          <div className="absolute right-0 top-8 z-20 bg-[#232323] border border-white/10 rounded-xl shadow-xl min-w-32.5 py-1">
                            <button onClick={() => toggleItemStatus(idx)} className={`flex items-center gap-2 w-full px-4 py-2.5 text-sm ${item.status === "active" ? "text-red-400" : "text-emerald-400"} hover:bg-white/5`}>
                              <span className={`w-4 h-4 rounded-full border-2 ${item.status === "active" ? "border-red-400" : "border-emerald-400"}`} />
                              {item.status === "active" ? "Inactive" : "Active"}
                            </button>
                            <button className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-white/5"><span>ðŸ—‘</span> Delete</button>
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

      {showModal && (tab === "categories" ? <AddCategoryModal onClose={() => setShowModal(false)} /> : <AddItemModal onClose={() => setShowModal(false)} />)}
      {openMenu !== null && <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />}
    </div>
  );
}
