"use client";

import { useState, useRef } from "react";
import {
  Plus, Search, Pencil, MoreVertical, X, ChevronDown, Trash2, CloudUpload,
} from "lucide-react";
import { useVariantCategories } from "@/hooks/queries/useVariantCategories";
import { useVariantItems } from "@/hooks/queries/useVariantItems";
import { useCreateVariantCategory } from "@/hooks/mutations/useCreateVariantCategory";
import { useUpdateVariantCategory } from "@/hooks/mutations/useUpdateVariantCategory";
import { useDeleteVariantCategory } from "@/hooks/mutations/useDeleteVariantCategory";
import { useCreateVariantItem } from "@/hooks/mutations/useCreateVariantItem";
import { useUpdateVariantItem } from "@/hooks/mutations/useUpdateVariantItem";
import { useDeleteVariantItem } from "@/hooks/mutations/useDeleteVariantItem";
import { VariantCategory, VariantItem } from "@/types/variant.types";

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

// ── Add/Edit Category Modal ────────────────────────────────────
function CategoryModal({
  existing,
  onClose,
}: {
  existing?: VariantCategory;
  onClose: () => void;
}) {
  const [name, setName] = useState(existing?.name ?? "");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { mutate: createCategory, isPending: creating } = useCreateVariantCategory();
  const { mutate: updateCategory, isPending: updating } = useUpdateVariantCategory();
  const isPending = creating || updating;

  const handleFile = (file: File) => {
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    if (existing) {
      const payload: { name?: string; image?: File } = {};
      if (name.trim() !== existing.name) payload.name = name.trim();
      if (image) payload.image = image;
      updateCategory({ id: existing._id, payload }, { onSuccess: () => onClose() });
    } else {
      createCategory({ name: name.trim(), ...(image ? { image } : {}) }, { onSuccess: () => onClose() });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-[#1a1a1a] rounded-2xl w-full max-w-[500px] mx-4">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">
            {existing ? "Edit Category" : "Add New Category"}
          </h2>
          <button onClick={onClose} className="text-red-400 hover:text-red-300 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="px-6 py-5 space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white">
              <span className="text-red-400">*</span> Variant Category
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter category name"
              className="w-full bg-transparent border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-white/30 transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white">Category Image <span className="text-white/40 text-xs">(optional)</span></label>
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-white/15 rounded-xl p-6 text-center cursor-pointer hover:border-white/25 transition-colors"
            >
              {preview ? (
                <img src={preview} alt="preview" className="mx-auto h-16 w-16 object-cover rounded-xl" />
              ) : existing?.image ? (
                <img src={existing.image} alt={existing.name} className="mx-auto h-16 w-16 object-cover rounded-xl" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              ) : (
                <>
                  <CloudUpload size={28} className="mx-auto text-white/40 mb-2" />
                  <p className="text-sm text-white/50">Click to upload image</p>
                </>
              )}
              <p className="text-xs text-white/30 mt-1">Webp, JPEG, PNG</p>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          </div>
        </div>
        <div className="px-6 pb-6 pt-2 border-t border-white/10">
          <div className="flex gap-3 mt-4">
            <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/15 text-white text-sm font-medium hover:bg-white/5 transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isPending || !name.trim()}
              className="flex-1 py-3 rounded-xl bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? "Saving..." : existing ? "Save Changes" : "Save Category"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Add/Edit Item Modal ────────────────────────────────────────
function ItemModal({
  existing,
  categories,
  onClose,
}: {
  existing?: VariantItem;
  categories: VariantCategory[];
  onClose: () => void;
}) {
  const [name, setName] = useState(existing?.name ?? "");
  const [categoryId, setCategoryId] = useState(
    existing?.variantCategoryId ?? ""
  );

  const { mutate: createItem, isPending: creating } = useCreateVariantItem();
  const { mutate: updateItem, isPending: updating } = useUpdateVariantItem();
  const isPending = creating || updating;

  const handleSubmit = () => {
    if (!name.trim() || !categoryId) return;
    if (existing) {
      const payload: { name?: string; variantCategoryId?: string } = {};
      if (name.trim() !== existing.name) payload.name = name.trim();
      if (categoryId !== existing.variantCategoryId) payload.variantCategoryId = categoryId;
      updateItem({ id: existing._id, payload }, { onSuccess: () => onClose() });
    } else {
      createItem({ name: name.trim(), variantCategoryId: categoryId }, { onSuccess: () => onClose() });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-[#1a1a1a] rounded-2xl w-full max-w-[500px] mx-4">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">
            {existing ? "Edit Item" : "Add New Item"}
          </h2>
          <button onClick={onClose} className="text-red-400 hover:text-red-300 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="px-6 py-5 space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white">
              <span className="text-red-400">*</span> Item Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter item name"
              className="w-full bg-transparent border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-white/30 transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white">
              <span className="text-red-400">*</span> Variant Category
            </label>
            <div className="relative">
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="appearance-none w-full bg-transparent border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-white/30 transition-colors [color-scheme:dark]"
              >
                <option value="">Select variant category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
            </div>
          </div>
        </div>
        <div className="px-6 pb-6 pt-2 border-t border-white/10">
          <div className="flex gap-3 mt-4">
            <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/15 text-white text-sm font-medium hover:bg-white/5 transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isPending || !name.trim() || !categoryId}
              className="flex-1 py-3 rounded-xl bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? "Saving..." : existing ? "Save Changes" : "Save Item"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Delete Confirm Modal ───────────────────────────────────────
function DeleteModal({
  label,
  onConfirm,
  isPending,
  onClose,
}: {
  label: string;
  onConfirm: () => void;
  isPending: boolean;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-[#1a1a1a] rounded-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Confirm Delete</h2>
          <button onClick={onClose} className="text-red-400 hover:text-red-300 transition-colors"><X size={20} /></button>
        </div>
        <p className="text-sm text-white/60 mb-6">
          Are you sure you want to delete <span className="text-white font-medium">{label}</span>? This cannot be undone.
        </p>
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
export default function VariantsPage() {
  const [tab, setTab] = useState<Tab>("categories");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const [editCat, setEditCat] = useState<VariantCategory | null>(null);
  const [deleteCat, setDeleteCat] = useState<VariantCategory | null>(null);
  const [showAddCat, setShowAddCat] = useState(false);

  const [editItem, setEditItem] = useState<VariantItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<VariantItem | null>(null);
  const [showAddItem, setShowAddItem] = useState(false);

  const catParams = {
    ...(search ? { searchTerm: search } : {}),
    ...(statusFilter !== "all" ? { status: statusFilter } : {}),
  };

  const itemParams = {
    ...(search ? { searchTerm: search } : {}),
    ...(statusFilter !== "all" ? { status: statusFilter } : {}),
    ...(categoryFilter ? { variantCategoryId: categoryFilter } : {}),
  };

  const { data: catData, isLoading: catLoading, isError: catError } = useVariantCategories(catParams);
  const { data: itemData, isLoading: itemLoading, isError: itemError } = useVariantItems(itemParams);
  const { mutate: updateCat } = useUpdateVariantCategory();
  const { mutate: deleteCatMutation, isPending: deletingCat } = useDeleteVariantCategory();
  const { mutate: updateItem } = useUpdateVariantItem();
  const { mutate: deleteItemMutation, isPending: deletingItem } = useDeleteVariantItem();

  const categories = catData ?? [];
  const items = itemData ?? [];

  const toggleCatStatus = (cat: VariantCategory) => {
    updateCat({ id: cat._id, payload: { status: cat.status === "active" ? "inactive" : "active" } });
    setOpenMenu(null);
  };

  const toggleItemStatus = (item: VariantItem) => {
    updateItem({ id: item._id, payload: { status: item.status === "active" ? "inactive" : "active" } });
    setOpenMenu(null);
  };

  return (
    <div className="p-6 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-white">Variants</h1>
        <button
          onClick={() => tab === "categories" ? setShowAddCat(true) : setShowAddItem(true)}
          className="flex items-center gap-2 bg-white text-black px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-white/90 transition-colors"
        >
          <Plus size={16} />
          {tab === "categories" ? "Add New Category" : "Add New Item"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {(["categories", "items"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setSearch(""); setStatusFilter("all"); setOpenMenu(null); }}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              tab === t ? "bg-white text-black" : "bg-[#1a1a1a] text-white/60 hover:text-white border border-white/10"
            }`}
          >
            {t === "categories" ? "Variant Categories" : "Variant Items"}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 w-72">
          <Search size={16} className="text-white/30 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name..."
            className="bg-transparent text-sm text-white placeholder-white/30 outline-none w-full"
          />
        </div>
        <div className="flex items-center gap-2">
          {tab === "items" && (
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="appearance-none bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 pr-8 text-sm text-white outline-none cursor-pointer focus:border-white/20 [color-scheme:dark]"
              >
                <option value="">All Category</option>
                {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
            </div>
          )}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | Status)}
              className="appearance-none bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 pr-8 text-sm text-white outline-none cursor-pointer focus:border-white/20 [color-scheme:dark]"
            >
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
                  <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">SL</th>
                  <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">Category ID</th>
                  <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">Variant Category</th>
                  <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">Action</th>
                </>
              ) : (
                <>
                  <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">SL</th>
                  <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">Item ID</th>
                  <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">Variant Item</th>
                  <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">Variant Category</th>
                  <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">Action</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {tab === "categories" ? (
              catLoading ? (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-sm text-white/40">Loading...</td></tr>
              ) : catError ? (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-sm text-red-400">Failed to load categories.</td></tr>
              ) : categories.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-sm text-white/40">No categories found.</td></tr>
              ) : (
                categories.map((cat, idx) => (
                  <tr key={cat._id} className="border-b border-white/4 hover:bg-white/2 transition-colors">
                    <td className="px-5 py-4 text-sm text-white/60">{String(idx + 1).padStart(2, "0")}</td>
                    <td className="px-5 py-4 text-sm text-white/60">{cat.variantCategoryId}</td>
                    <td className="px-5 py-4 text-sm text-white font-medium">{cat.name}</td>
                    <td className="px-5 py-4"><StatusBadge status={cat.status} /></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 relative">
                        <button onClick={() => setEditCat(cat)} className="p-1.5 text-white/40 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => setOpenMenu(openMenu === cat._id ? null : cat._id)} className="p-1.5 text-white/40 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                          <MoreVertical size={15} />
                        </button>
                        {openMenu === cat._id && (
                          <div className="absolute right-0 top-8 z-20 bg-[#232323] border border-white/10 rounded-xl shadow-xl min-w-36 py-1">
                            <button
                              onClick={() => toggleCatStatus(cat)}
                              className={`flex items-center gap-2 w-full px-4 py-2.5 text-sm ${cat.status === "active" ? "text-red-400" : "text-emerald-400"} hover:bg-white/5 transition-colors`}
                            >
                              <span className={`w-4 h-4 rounded-full border-2 ${cat.status === "active" ? "border-red-400" : "border-emerald-400"}`} />
                              {cat.status === "active" ? "Set Inactive" : "Set Active"}
                            </button>
                            <button
                              onClick={() => { setDeleteCat(cat); setOpenMenu(null); }}
                              className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-white/5 transition-colors"
                            >
                              <Trash2 size={14} /> Delete
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
                <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-white/40">Loading...</td></tr>
              ) : itemError ? (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-red-400">Failed to load items.</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-white/40">No items found.</td></tr>
              ) : (
                items.map((item, idx) => (
                  <tr key={item._id} className="border-b border-white/4 hover:bg-white/2 transition-colors">
                    <td className="px-5 py-4 text-sm text-white/60">{String(idx + 1).padStart(2, "0")}</td>
                    <td className="px-5 py-4 text-sm text-white/60">{item.variantItemId}</td>
                    <td className="px-5 py-4 text-sm text-white font-medium">{item.name}</td>
                    <td className="px-5 py-4 text-sm text-white/70">
                      {item.variantCategory?.name ?? categories.find(c => c._id === item.variantCategoryId)?.name ?? "—"}
                    </td>
                    <td className="px-5 py-4"><StatusBadge status={item.status} /></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 relative">
                        <button onClick={() => setEditItem(item)} className="p-1.5 text-white/40 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => setOpenMenu(openMenu === item._id ? null : item._id)} className="p-1.5 text-white/40 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                          <MoreVertical size={15} />
                        </button>
                        {openMenu === item._id && (
                          <div className="absolute right-0 top-8 z-20 bg-[#232323] border border-white/10 rounded-xl shadow-xl min-w-36 py-1">
                            <button
                              onClick={() => toggleItemStatus(item)}
                              className={`flex items-center gap-2 w-full px-4 py-2.5 text-sm ${item.status === "active" ? "text-red-400" : "text-emerald-400"} hover:bg-white/5 transition-colors`}
                            >
                              <span className={`w-4 h-4 rounded-full border-2 ${item.status === "active" ? "border-red-400" : "border-emerald-400"}`} />
                              {item.status === "active" ? "Set Inactive" : "Set Active"}
                            </button>
                            <button
                              onClick={() => { setDeleteItem(item); setOpenMenu(null); }}
                              className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-white/5 transition-colors"
                            >
                              <Trash2 size={14} /> Delete
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

      {/* Modals */}
      {showAddCat && <CategoryModal onClose={() => setShowAddCat(false)} />}
      {editCat && <CategoryModal existing={editCat} onClose={() => setEditCat(null)} />}
      {deleteCat && (
        <DeleteModal
          label={deleteCat.name}
          isPending={deletingCat}
          onConfirm={() => deleteCatMutation(deleteCat._id, { onSuccess: () => setDeleteCat(null) })}
          onClose={() => setDeleteCat(null)}
        />
      )}

      {showAddItem && <ItemModal categories={categories} onClose={() => setShowAddItem(false)} />}
      {editItem && <ItemModal existing={editItem} categories={categories} onClose={() => setEditItem(null)} />}
      {deleteItem && (
        <DeleteModal
          label={deleteItem.name}
          isPending={deletingItem}
          onConfirm={() => deleteItemMutation(deleteItem._id, { onSuccess: () => setDeleteItem(null) })}
          onClose={() => setDeleteItem(null)}
        />
      )}

      {openMenu !== null && <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />}
    </div>
  );
}
