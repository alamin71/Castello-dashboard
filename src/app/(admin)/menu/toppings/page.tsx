"use client";

import { useState } from "react";
import { Plus, Search, Pencil, MoreVertical, X, ChevronDown, Trash2, Ban, CircleCheck } from "lucide-react";
import { useToppingCategories } from "@/hooks/queries/useToppingCategories";
import { useToppingItems } from "@/hooks/queries/useToppingItems";
import { useCreateToppingCategory } from "@/hooks/mutations/useCreateToppingCategory";
import { useUpdateToppingCategory } from "@/hooks/mutations/useUpdateToppingCategory";
import { useDeleteToppingCategory } from "@/hooks/mutations/useDeleteToppingCategory";
import { useCreateToppingItem } from "@/hooks/mutations/useCreateToppingItem";
import { useUpdateToppingItem } from "@/hooks/mutations/useUpdateToppingItem";
import { useDeleteToppingItem } from "@/hooks/mutations/useDeleteToppingItem";
import { ToppingCategory, ToppingItem } from "@/types/topping.types";

type Status = "active" | "inactive";
type Tab = "categories" | "items";

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

function CatSkeletonRow() {
  return (
    <tr className="border-b border-white/4">
      <td className="px-5 py-4"><div className="skeleton h-4 w-6 rounded" /></td>
      <td className="px-5 py-4"><div className="skeleton h-4 w-28 rounded" /></td>
      <td className="px-5 py-4"><div className="skeleton h-4 w-36 rounded" /></td>
      <td className="px-5 py-4"><div className="skeleton h-4 w-8 rounded" /></td>
      <td className="px-5 py-4"><div className="skeleton h-6 w-20 rounded-full" /></td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-1">
          <div className="skeleton w-7 h-7 rounded-lg" />
          <div className="skeleton w-7 h-7 rounded-lg" />
        </div>
      </td>
    </tr>
  );
}

function ItemSkeletonRow() {
  return (
    <tr className="border-b border-white/4">
      <td className="px-5 py-4"><div className="skeleton h-4 w-6 rounded" /></td>
      <td className="px-5 py-4"><div className="skeleton h-4 w-28 rounded" /></td>
      <td className="px-5 py-4"><div className="skeleton h-4 w-36 rounded" /></td>
      <td className="px-5 py-4"><div className="skeleton h-4 w-28 rounded" /></td>
      <td className="px-5 py-4"><div className="skeleton h-4 w-16 rounded" /></td>
      <td className="px-5 py-4"><div className="skeleton h-6 w-20 rounded-full" /></td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-1">
          <div className="skeleton w-7 h-7 rounded-lg" />
          <div className="skeleton w-7 h-7 rounded-lg" />
        </div>
      </td>
    </tr>
  );
}

// ── Category Modal ─────────────────────────────────────────────
function CategoryModal({ existing, onClose }: { existing?: ToppingCategory; onClose: () => void }) {
  const [name, setName] = useState(existing?.name ?? "");
  const { mutate: create, isPending: creating } = useCreateToppingCategory();
  const { mutate: update, isPending: updating } = useUpdateToppingCategory();
  const isPending = creating || updating;

  const handleSubmit = () => {
    if (!name.trim()) return;
    if (existing) {
      update({ id: existing._id, payload: { name: name.trim() } }, { onSuccess: () => onClose() });
    } else {
      create({ name: name.trim() }, { onSuccess: () => onClose() });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-[#1a1a1a] rounded-2xl w-full max-w-125 mx-4">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">{existing ? "Edit Category" : "Add New Category"}</h2>
          <button onClick={onClose} className="text-red-400 hover:text-red-300 transition-colors"><X size={20} /></button>
        </div>
        <div className="px-6 py-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white"><span className="text-red-400">*</span> Toppings Category</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()} placeholder="Enter category name"
              className="w-full bg-transparent border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-white transition-colors" />
          </div>
        </div>
        <div className="px-6 pb-6 pt-2 border-t border-white/10">
          <div className="flex gap-3 mt-4">
            <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/15 text-white text-sm font-medium hover:bg-white/5 transition-colors">Cancel</button>
            <button onClick={handleSubmit} disabled={isPending || !name.trim()}
              className="flex-1 py-3 rounded-xl bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {isPending ? "Saving..." : existing ? "Save Changes" : "Save Category"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Item Modal ─────────────────────────────────────────────────
function ItemModal({ existing, categories, onClose }: { existing?: ToppingItem; categories: ToppingCategory[]; onClose: () => void }) {
  const [name, setName] = useState(existing?.name ?? "");
  const [price, setPrice] = useState(existing?.price?.toString() ?? "");
  const [categoryId, setCategoryId] = useState(() => {
    if (!existing) return "";
    const v = existing.toppingCategoryId;
    return typeof v === "string" ? v : v?._id ?? "";
  });
  const { mutate: create, isPending: creating } = useCreateToppingItem();
  const { mutate: update, isPending: updating } = useUpdateToppingItem();
  const isPending = creating || updating;

  const handleSubmit = () => {
    if (!name.trim() || !categoryId || !price) return;
    if (existing) {
      const payload: { name?: string; toppingCategoryId?: string; price?: number } = {};
      if (name.trim() !== existing.name) payload.name = name.trim();
      if (categoryId !== (typeof existing.toppingCategoryId === "string" ? existing.toppingCategoryId : existing.toppingCategoryId?._id)) payload.toppingCategoryId = categoryId;
      if (Number(price) !== existing.price) payload.price = Number(price);
      update({ id: existing._id, payload }, { onSuccess: () => onClose() });
    } else {
      create({ name: name.trim(), toppingCategoryId: categoryId, price: Number(price) }, { onSuccess: () => onClose() });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-[#1a1a1a] rounded-2xl w-full max-w-125 mx-4">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">{existing ? "Edit Item" : "Add New Item"}</h2>
          <button onClick={onClose} className="text-red-400 hover:text-red-300 transition-colors"><X size={20} /></button>
        </div>
        <div className="px-6 py-5 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white"><span className="text-red-400">*</span> Item Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter item name"
                className="w-full bg-transparent border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-white transition-colors" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white"><span className="text-red-400">*</span> Price</label>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Enter price" min={0}
                className="w-full bg-transparent border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-white transition-colors" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white"><span className="text-red-400">*</span> Toppings Category</label>
            <div className="relative">
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
                className="appearance-none w-full bg-transparent border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-white transition-colors scheme-dark">
                <option value="">Select toppings category</option>
                {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
            </div>
          </div>
        </div>
        <div className="px-6 pb-6 pt-2 border-t border-white/10">
          <div className="flex gap-3 mt-4">
            <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/15 text-white text-sm font-medium hover:bg-white/5 transition-colors">Cancel</button>
            <button onClick={handleSubmit} disabled={isPending || !name.trim() || !categoryId || !price}
              className="flex-1 py-3 rounded-xl bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {isPending ? "Saving..." : existing ? "Save Changes" : "Save Item"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Delete Confirm ─────────────────────────────────────────────
function DeleteModal({ label, onConfirm, isPending, onClose }: { label: string; onConfirm: () => void; isPending: boolean; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-[#1a1a1a] rounded-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Confirm Delete</h2>
          <button onClick={onClose} className="text-red-400 hover:text-red-300 transition-colors"><X size={20} /></button>
        </div>
        <p className="text-sm text-white/60 mb-6">Are you sure you want to delete <span className="text-white font-medium">{label}</span>? This cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/15 text-white text-sm font-medium hover:bg-white/5 transition-colors">Cancel</button>
          <button onClick={onConfirm} disabled={isPending} className="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {isPending ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export default function ToppingsPage() {
  const [tab, setTab] = useState<Tab>("categories");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top?: number; bottom?: number; right: number } | null>(null);

  const [catPage, setCatPage] = useState(1);
  const [catLimit, setCatLimit] = useState(10);
  const [itemPage, setItemPage] = useState(1);
  const [itemLimit, setItemLimit] = useState(10);

  const [showAddCat, setShowAddCat] = useState(false);
  const [editCat, setEditCat] = useState<ToppingCategory | null>(null);
  const [deleteCat, setDeleteCat] = useState<ToppingCategory | null>(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [editItem, setEditItem] = useState<ToppingItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<ToppingItem | null>(null);

  const catParams = {
    page: catPage, limit: catLimit,
    ...(search ? { searchTerm: search } : {}),
    ...(statusFilter !== "all" ? { status: statusFilter } : {}),
  };

  const itemParams = {
    page: itemPage, limit: itemLimit,
    ...(search ? { searchTerm: search } : {}),
    ...(statusFilter !== "all" ? { status: statusFilter } : {}),
    ...(categoryFilter ? { toppingCategoryId: categoryFilter } : {}),
  };

  const { data: catData, isLoading: catLoading, isError: catError } = useToppingCategories(catParams);
  const { data: allCatData } = useToppingCategories({});
  const { data: itemData, isLoading: itemLoading, isError: itemError } = useToppingItems(itemParams);

  const { mutate: updateCat } = useUpdateToppingCategory();
  const { mutate: deleteCatMut, isPending: deletingCat } = useDeleteToppingCategory();
  const { mutate: updateItem } = useUpdateToppingItem();
  const { mutate: deleteItemMut, isPending: deletingItem } = useDeleteToppingItem();

  const categories = catData?.result ?? [];
  const catMeta = catData?.meta;
  const catTotalPages = catMeta?.totalPage ?? 1;

  const items = itemData?.result ?? [];
  const itemMeta = itemData?.meta;
  const itemTotalPages = itemMeta?.totalPage ?? 1;

  const allCategories = allCatData?.result ?? [];

  const page = tab === "categories" ? catPage : itemPage;
  const limit = tab === "categories" ? catLimit : itemLimit;
  const meta = tab === "categories" ? catMeta : itemMeta;
  const totalPages = tab === "categories" ? catTotalPages : itemTotalPages;
  const setPage = tab === "categories" ? setCatPage : setItemPage;
  const setLimit = tab === "categories" ? setCatLimit : setItemLimit;

  const getCategoryName = (item: ToppingItem) => {
    if (item.toppingCategory?.name) return item.toppingCategory.name;
    if (typeof item.toppingCategoryId === "object" && item.toppingCategoryId?.name) return item.toppingCategoryId.name;
    const id = typeof item.toppingCategoryId === "string" ? item.toppingCategoryId : item.toppingCategoryId?._id;
    return allCategories.find(c => c._id === id)?.name ?? "—";
  };

  const toggleCatStatus = (cat: ToppingCategory) => {
    updateCat({ id: cat._id, payload: { status: cat.status === "active" ? "inactive" : "active" } });
    setOpenMenu(null);
  };

  const toggleItemStatus = (item: ToppingItem) => {
    updateItem({ id: item._id, payload: { status: item.status === "active" ? "inactive" : "active" } });
    setOpenMenu(null);
  };

  const openMenuAt = (id: string, e: React.MouseEvent<HTMLButtonElement>) => {
    if (openMenu === id) { setOpenMenu(null); return; }
    const rect = e.currentTarget.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    setMenuPosition(
      spaceBelow < 96
        ? { bottom: window.innerHeight - rect.top + 4, right: window.innerWidth - rect.right }
        : { top: rect.bottom + 4, right: window.innerWidth - rect.right }
    );
    setOpenMenu(id);
  };

  return (
    <div className="flex flex-col h-full p-6">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-white">Toppings</h1>
        <button
          onClick={() => tab === "categories" ? setShowAddCat(true) : setShowAddItem(true)}
          className="flex items-center gap-2 bg-white text-black px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-white/90 transition-colors"
        >
          <Plus size={16} />
          {tab === "categories" ? "Add New Category" : "Add New Item"}
        </button>
      </div>

      {/* Tabs */}
      <div className="shrink-0 flex gap-2 mb-5">
        {(["categories", "items"] as Tab[]).map((t) => (
          <button key={t} onClick={() => { setTab(t); setSearch(""); setStatusFilter("all"); setCategoryFilter(""); setOpenMenu(null); }}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${tab === t ? "bg-white text-black" : "bg-[#1a1a1a] text-white/60 hover:text-white border border-white/10"}`}>
            {t === "categories" ? "Toppings Categories" : "Toppings Items"}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="shrink-0 flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 w-72 focus-within:border-white transition-colors">
          <Search size={16} className="text-white/30 shrink-0" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search by name..."
            className="bg-transparent text-sm text-white placeholder-white/30 outline-none w-full" />
        </div>
        <div className="flex items-center gap-2">
          {tab === "items" && (
            <div className="relative">
              <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setItemPage(1); }}
                className="appearance-none bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 pr-8 text-sm text-white outline-none cursor-pointer focus:border-white scheme-dark">
                <option value="">All Category</option>
                {allCategories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
            </div>
          )}
          <div className="relative">
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value as "all" | Status); setPage(1); }}
              className="appearance-none bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 pr-8 text-sm text-white outline-none cursor-pointer focus:border-white scheme-dark">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 min-h-0 bg-[#1a1a1a] rounded-2xl overflow-hidden border border-white/6">
        <div className="h-full overflow-y-auto" onScroll={() => openMenu !== null && setOpenMenu(null)}>
          <table className="w-full">
            <thead className="sticky top-0 z-10 bg-[#1a1a1a]">
              <tr className="border-b border-white/6">
                {tab === "categories" ? (
                  <>
                    <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider rounded-tl-2xl">SL</th>
                    <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">Category ID</th>
                    <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">Topping Category</th>
                    <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">Assigned Items</th>
                    <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">Status</th>
                    <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider rounded-tr-2xl">Action</th>
                  </>
                ) : (
                  <>
                    <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider rounded-tl-2xl">SL</th>
                    <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">Item ID</th>
                    <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">Topping Item</th>
                    <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">Topping Category</th>
                    <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">Price Per Item (Kr.)</th>
                    <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">Status</th>
                    <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider rounded-tr-2xl">Action</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {tab === "categories" ? (
                catLoading ? (
                  Array.from({ length: 10 }).map((_, i) => <CatSkeletonRow key={i} />)
                ) : catError ? (
                  <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-red-400">Failed to load categories.</td></tr>
                ) : categories.length === 0 ? (
                  <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-white/40">No categories found.</td></tr>
                ) : (
                  categories.map((cat, idx) => (
                    <tr key={cat._id} className="border-b border-white/4 hover:bg-white/2 transition-colors">
                      <td className="px-5 py-4 text-sm text-white/60">{String((catPage - 1) * catLimit + idx + 1).padStart(2, "0")}</td>
                      <td className="px-5 py-4 text-sm text-white/60">{cat.toppingCategoryId}</td>
                      <td className="px-5 py-4 text-sm text-white font-medium">{cat.name}</td>
                      <td className="px-5 py-4 text-sm text-white/60">{String(cat.totalItems ?? 0).padStart(2, "0")}</td>
                      <td className="px-5 py-4"><StatusBadge status={cat.status} /></td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setEditCat(cat)} className="p-1.5 text-white/40 hover:text-white transition-colors rounded-lg hover:bg-white/5"><Pencil size={15} /></button>
                          <button onClick={(e) => openMenuAt(cat._id, e)} className="p-1.5 text-white/40 hover:text-white transition-colors rounded-lg hover:bg-white/5"><MoreVertical size={15} /></button>
                          {openMenu === cat._id && menuPosition && (
                            <div style={{ top: menuPosition.top, bottom: menuPosition.bottom, right: menuPosition.right }} className="fixed z-9999 bg-[#1e1e1e] border border-white/10 rounded-2xl shadow-2xl w-44 overflow-hidden">
                              <button onClick={() => toggleCatStatus(cat)} className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-medium transition-colors ${cat.status === "active" ? "text-red-400 hover:bg-red-400/8" : "text-emerald-400 hover:bg-emerald-400/8"}`}>
                                {cat.status === "active" ? <Ban size={16} /> : <CircleCheck size={16} />}
                                {cat.status === "active" ? "Inactive" : "Active"}
                              </button>
                              <div className="mx-4 h-px bg-white/8" />
                              <button onClick={() => { setDeleteCat(cat); setOpenMenu(null); }} className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-400/8 transition-colors">
                                <Trash2 size={16} /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )
              ) : (
                itemLoading ? (
                  Array.from({ length: 10 }).map((_, i) => <ItemSkeletonRow key={i} />)
                ) : itemError ? (
                  <tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-red-400">Failed to load items.</td></tr>
                ) : items.length === 0 ? (
                  <tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-white/40">No items found.</td></tr>
                ) : (
                  items.map((item, idx) => (
                    <tr key={item._id} className="border-b border-white/4 hover:bg-white/2 transition-colors">
                      <td className="px-5 py-4 text-sm text-white/60">{String((itemPage - 1) * itemLimit + idx + 1).padStart(2, "0")}</td>
                      <td className="px-5 py-4 text-sm text-white/60">{item.toppingItemId}</td>
                      <td className="px-5 py-4 text-sm text-white font-medium">{item.name}</td>
                      <td className="px-5 py-4 text-sm text-white/70">{getCategoryName(item)}</td>
                      <td className="px-5 py-4 text-sm text-white/70">{item.price}</td>
                      <td className="px-5 py-4"><StatusBadge status={item.status} /></td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setEditItem(item)} className="p-1.5 text-white/40 hover:text-white transition-colors rounded-lg hover:bg-white/5"><Pencil size={15} /></button>
                          <button onClick={(e) => openMenuAt(item._id, e)} className="p-1.5 text-white/40 hover:text-white transition-colors rounded-lg hover:bg-white/5"><MoreVertical size={15} /></button>
                          {openMenu === item._id && menuPosition && (
                            <div style={{ top: menuPosition.top, bottom: menuPosition.bottom, right: menuPosition.right }} className="fixed z-9999 bg-[#1e1e1e] border border-white/10 rounded-2xl shadow-2xl w-44 overflow-hidden">
                              <button onClick={() => toggleItemStatus(item)} className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-medium transition-colors ${item.status === "active" ? "text-red-400 hover:bg-red-400/8" : "text-emerald-400 hover:bg-emerald-400/8"}`}>
                                {item.status === "active" ? <Ban size={16} /> : <CircleCheck size={16} />}
                                {item.status === "active" ? "Inactive" : "Active"}
                              </button>
                              <div className="mx-4 h-px bg-white/8" />
                              <button onClick={() => { setDeleteItem(item); setOpenMenu(null); }} className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-400/8 transition-colors">
                                <Trash2 size={16} /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="shrink-0 flex items-center justify-between mt-5">
        <div className="flex items-center gap-2 text-sm text-white/40">
          <span>Showing per page</span>
          <div className="relative">
            <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
              className="appearance-none bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-1.5 pr-7 text-sm text-white outline-none scheme-dark">
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
          </div>
          {meta && (
            <span className="ml-2">
              {(page - 1) * limit + 1}–{Math.min(page * limit, meta.total)} of {meta.total}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-lg text-sm transition-colors ${p === page ? "bg-white text-black font-medium" : "text-white/50 hover:text-white hover:bg-white/5"}`}>
              {String(p).padStart(2, "0")}
            </button>
          ))}
        </div>
      </div>

      {/* Modals */}
      {showAddCat && <CategoryModal onClose={() => setShowAddCat(false)} />}
      {editCat && <CategoryModal existing={editCat} onClose={() => setEditCat(null)} />}
      {deleteCat && <DeleteModal label={deleteCat.name} isPending={deletingCat}
        onConfirm={() => deleteCatMut(deleteCat._id, { onSuccess: () => setDeleteCat(null) })}
        onClose={() => setDeleteCat(null)} />}

      {showAddItem && <ItemModal categories={allCategories} onClose={() => setShowAddItem(false)} />}
      {editItem && <ItemModal existing={editItem} categories={allCategories} onClose={() => setEditItem(null)} />}
      {deleteItem && <DeleteModal label={deleteItem.name} isPending={deletingItem}
        onConfirm={() => deleteItemMut(deleteItem._id, { onSuccess: () => setDeleteItem(null) })}
        onClose={() => setDeleteItem(null)} />}

      {openMenu !== null && (
        <div className="fixed inset-0 z-9998" onClick={() => { setOpenMenu(null); setMenuPosition(null); }} />
      )}
    </div>
  );
}
