"use client";

import { useState, useRef, useEffect } from "react";
import {
  Plus,
  Search,
  Pencil,
  MoreVertical,
  CloudUpload,
  X,
  ChevronDown,
  Trash2,
  GripVertical,
  Ban,
  CircleCheck,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useCategories } from "@/hooks/queries/useCategories";
import { useCreateCategory } from "@/hooks/mutations/useCreateCategory";
import { useUpdateCategory } from "@/hooks/mutations/useUpdateCategory";
import { useDeleteCategory } from "@/hooks/mutations/useDeleteCategory";
import { useReorderCategories } from "@/hooks/mutations/useReorderCategories";
import { CategoryItem } from "@/types/category.types";

type Status = "active" | "inactive";

function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border ${
        status === "active"
          ? "border-emerald-500 text-emerald-400"
          : "border-red-500 text-red-400"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${status === "active" ? "bg-emerald-400" : "bg-red-400"}`}
      />
      {status === "active" ? "Active" : "Inactive"}
    </span>
  );
}

function AddCategoryModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { mutate: createCategory, isPending } = useCreateCategory();

  const handleFile = (file: File) => {
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleSubmit = () => {
    if (!name.trim() || !image) return;
    createCategory(
      { name: name.trim(), image },
      { onSuccess: () => onClose() }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-[#1a1a1a] rounded-2xl w-full max-w-125 mx-4">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Add New Category</h2>
          <button onClick={onClose} className="text-red-400 hover:text-red-300 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="px-6 py-5 space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white">
              <span className="text-red-400">*</span> Category Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter category name"
              className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-white transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white">
              <span className="text-red-400">*</span> Category Image
            </label>
            <div
              onClick={() => fileRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-white/15 rounded-xl p-8 text-center cursor-pointer hover:border-white/25 transition-colors"
            >
              {preview ? (
                <img src={preview} alt="preview" className="mx-auto h-20 w-20 object-cover rounded-xl" />
              ) : (
                <>
                  <CloudUpload size={32} className="mx-auto text-white/40 mb-2" />
                  <p className="text-sm text-white/50">Upload an image</p>
                  <p className="text-xs text-white/30 mt-1">Webp, JPEG, PNG · 48×48 px</p>
                </>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
          </div>
        </div>
        <div className="px-6 pb-6 pt-2 border-t border-white/10">
          <div className="flex gap-3 mt-4">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-white/15 text-white text-sm font-medium hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isPending || !name.trim() || !image}
              className="flex-1 py-3 rounded-xl bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? "Saving..." : "Save Category"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditCategoryModal({
  category,
  onClose,
}: {
  category: CategoryItem;
  onClose: () => void;
}) {
  const [name, setName] = useState(category.name);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { mutate: updateCategory, isPending } = useUpdateCategory();

  const handleFile = (file: File) => {
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = () => {
    const payload: { name?: string; image?: File } = {};
    if (name.trim() !== category.name) payload.name = name.trim();
    if (image) payload.image = image;
    if (!payload.name && !payload.image) { onClose(); return; }
    updateCategory(
      { id: category._id, payload },
      { onSuccess: () => onClose() }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-[#1a1a1a] rounded-2xl w-full max-w-125 mx-4">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Edit Category</h2>
          <button onClick={onClose} className="text-red-400 hover:text-red-300 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="px-6 py-5 space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white">Category Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter category name"
              className="w-full bg-transparent border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-white transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white">Category Image</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-white/15 rounded-xl p-6 text-center cursor-pointer hover:border-white/25 transition-colors"
            >
              {preview ? (
                <img src={preview} alt="preview" className="mx-auto h-20 w-20 object-cover rounded-xl" />
              ) : category.image ? (
                <img src={category.image} alt={category.name} className="mx-auto h-20 w-20 object-cover rounded-xl" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              ) : (
                <>
                  <CloudUpload size={28} className="mx-auto text-white/40 mb-2" />
                  <p className="text-sm text-white/50">Click to upload new image</p>
                </>
              )}
              <p className="text-xs text-white/30 mt-2">Click to change image</p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
          </div>
        </div>
        <div className="px-6 pb-6 pt-2 border-t border-white/10">
          <div className="flex gap-3 mt-4">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-white/15 text-white text-sm font-medium hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className="flex-1 py-3 rounded-xl bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CategorySkeletonRow() {
  return (
    <tr className="border-b border-white/4">
      <td className="px-5 py-4"><div className="skeleton h-4 w-6 rounded" /></td>
      <td className="px-5 py-4"><div className="skeleton h-4 w-24 rounded" /></td>
      <td className="px-5 py-4"><div className="skeleton w-9 h-9 rounded-lg" /></td>
      <td className="px-5 py-4"><div className="skeleton h-4 w-36 rounded" /></td>
      <td className="px-5 py-4"><div className="skeleton h-4 w-8 rounded" /></td>
      <td className="px-5 py-4"><div className="skeleton h-6 w-20 rounded-full" /></td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-1">
          <div className="skeleton w-7 h-7 rounded-lg" />
          <div className="skeleton w-7 h-7 rounded-lg" />
          <div className="skeleton w-7 h-7 rounded-lg" />
        </div>
      </td>
    </tr>
  );
}

function DeleteConfirmModal({
  category,
  onClose,
}: {
  category: CategoryItem;
  onClose: () => void;
}) {
  const { mutate: deleteCategory, isPending } = useDeleteCategory();

  const handleDelete = () => {
    deleteCategory(category._id, { onSuccess: () => onClose() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-[#1a1a1a] rounded-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Delete Category</h2>
          <button onClick={onClose} className="text-red-400 hover:text-red-300 transition-colors">
            <X size={20} />
          </button>
        </div>
        <p className="text-sm text-white/60 mb-6">
          Are you sure you want to delete{" "}
          <span className="text-white font-medium">{category.name}</span>? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-white/15 text-white text-sm font-medium hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CategoryPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editCategory, setEditCategory] = useState<CategoryItem | null>(null);
  const [deleteCategory, setDeleteCategory] = useState<CategoryItem | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top?: number; bottom?: number; right: number } | null>(null);

  // drag-and-drop state
  const [localOrder, setLocalOrder] = useState<CategoryItem[] | null>(null);
  const dragIndexRef = useRef<number | null>(null);
  const pendingReorderRef = useRef(false);

  const queryClient = useQueryClient();
  const { mutate: updateCategory } = useUpdateCategory();
  const { mutate: reorderCategories } = useReorderCategories();

  const params = {
    page,
    limit,
    ...(search ? { searchTerm: search } : {}),
    ...(statusFilter !== "all" ? { status: statusFilter } : {}),
  };

  const { data, isLoading, isError } = useCategories(params);

  // once server data arrives after a reorder, clear localOrder so UI shows confirmed state
  useEffect(() => {
    if (pendingReorderRef.current && data) {
      setLocalOrder(null);
      pendingReorderRef.current = false;
    }
  }, [data]);

  // use localOrder optimistically, fall back to server data
  const categories = localOrder ?? data?.result ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPage ?? 1;

  const toggleStatus = (cat: CategoryItem) => {
    const newStatus: Status = cat.status === "active" ? "inactive" : "active";
    updateCategory({ id: cat._id, payload: { status: newStatus } });
    setOpenMenu(null);
  };

  const handleDragStart = (idx: number) => {
    dragIndexRef.current = idx;
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    const from = dragIndexRef.current;
    if (from === null || from === idx) return;
    const reordered = [...categories];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(idx, 0, moved);
    dragIndexRef.current = idx;
    setLocalOrder(reordered);
  };

  const handleDrop = () => {
    dragIndexRef.current = null;
    if (!localOrder) return;
    const orderedIds = localOrder.map((c) => c._id);
    reorderCategories(orderedIds, {
      onSuccess: () => {
        // mark that we're waiting for server data, then invalidate to refetch
        pendingReorderRef.current = true;
        queryClient.invalidateQueries({ queryKey: ["categories"] });
      },
      onError: () => {
        // rollback to server data
        setLocalOrder(null);
      },
    });
  };

  return (
    <div className="flex flex-col h-full p-6">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-white">Categories</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-white text-black px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-white/90 transition-colors"
        >
          <Plus size={16} />
          Add New Category
        </button>
      </div>

      {/* Filters */}
      <div className="shrink-0 flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 w-72 focus-within:border-white transition-colors">
          <Search size={16} className="text-white/30 shrink-0" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search category..."
            className="bg-transparent text-sm text-white placeholder-white/30 outline-none w-full"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as "all" | Status); setPage(1); }}
            className="appearance-none bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 pr-8 text-sm text-white outline-none cursor-pointer focus:border-white scheme-dark"
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
        <div className="h-full overflow-y-auto" onScroll={() => openMenu !== null && setOpenMenu(null)}>
        <table className="w-full">
          <thead className="sticky top-0 z-10 bg-[#1a1a1a]">
            <tr className="border-b border-white/6">
              <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider rounded-tl-2xl">SL</th>
              <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">Category ID</th>
              <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">Photo</th>
              <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">Category Name</th>
              <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">Assigned Products</th>
              <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">Status</th>
              <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider rounded-tr-2xl">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => <CategorySkeletonRow key={i} />)
            ) : isError ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-sm text-red-400">
                  Failed to load categories.
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-sm text-white/40">
                  No categories found.
                </td>
              </tr>
            ) : (
              categories.map((cat, idx) => (
                <tr
                  key={cat._id}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDrop={handleDrop}
                  className="border-b border-white/4 hover:bg-white/2 transition-colors"
                >
                  <td className="px-5 py-4 text-sm text-white/60">
                    {String((page - 1) * limit + idx + 1).padStart(2, "0")}
                  </td>
                  <td className="px-5 py-4 text-sm text-white/60">{cat.categoryId}</td>
                  <td className="px-5 py-4">
                    <div className="w-9 h-9 rounded-lg bg-white/10 overflow-hidden shrink-0">
                      {cat.image ? (
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/30 text-xs">
                          {cat.name[0]}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-white font-medium">{cat.name}</span>
                  </td>
                  <td className="px-5 py-4 text-sm text-white/60">
                    {String(cat.totalProducts ?? 0).padStart(2, "0")}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={cat.status} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditCategory(cat)}
                        className="p-1.5 text-white/40 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={(e) => {
                          if (openMenu === cat._id) {
                            setOpenMenu(null);
                          } else {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const spaceBelow = window.innerHeight - rect.bottom;
                            setMenuPosition(
                              spaceBelow < 160
                                ? { bottom: window.innerHeight - rect.top + 4, right: window.innerWidth - rect.right }
                                : { top: rect.bottom + 4, right: window.innerWidth - rect.right }
                            );
                            setOpenMenu(cat._id);
                          }
                        }}
                        className="p-1.5 text-white/40 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                      >
                        <MoreVertical size={15} />
                      </button>
                      <button
                        title="Drag to reorder"
                        className="p-1.5 text-white/30 cursor-grab active:cursor-grabbing rounded-lg hover:bg-white/5"
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        <GripVertical size={15} />
                      </button>
                      {openMenu === cat._id && menuPosition && (
                        <div
                          style={{ top: menuPosition.top, bottom: menuPosition.bottom, right: menuPosition.right }}
                          className="fixed z-9999 bg-[#1e1e1e] border border-white/10 rounded-2xl shadow-2xl w-44 overflow-hidden"
                        >
                          <button
                            onClick={() => toggleStatus(cat)}
                            className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-medium transition-colors ${
                              cat.status === "active"
                                ? "text-red-400 hover:bg-red-400/8"
                                : "text-emerald-400 hover:bg-emerald-400/8"
                            }`}
                          >
                            {cat.status === "active" ? <Ban size={16} /> : <CircleCheck size={16} />}
                            {cat.status === "active" ? "Inactive" : "Active"}
                          </button>
                          <div className="mx-4 h-px bg-white/8" />
                          <button
                            onClick={() => { setDeleteCategory(cat); setOpenMenu(null); }}
                            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-400/8 transition-colors"
                          >
                            <Trash2 size={16} /> Delete
                          </button>
                        </div>
                      )}
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
      <div className="shrink-0 flex items-center justify-between mt-5">
        <div className="flex items-center gap-2 text-sm text-white/40">
          <span>Showing per page</span>
          <div className="relative">
            <select
              value={limit}
              onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
              className="appearance-none bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-1.5 pr-7 text-sm text-white outline-none"
            >
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
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-lg text-sm transition-colors ${
                p === page
                  ? "bg-white text-black font-medium"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              {String(p).padStart(2, "0")}
            </button>
          ))}
        </div>
      </div>

      {/* Modals */}
      {showAddModal && <AddCategoryModal onClose={() => setShowAddModal(false)} />}
      {editCategory && <EditCategoryModal category={editCategory} onClose={() => setEditCategory(null)} />}
      {deleteCategory && <DeleteConfirmModal category={deleteCategory} onClose={() => setDeleteCategory(null)} />}

      {/* Close menu on outside click */}
      {openMenu !== null && (
        <div className="fixed inset-0 z-9998" onClick={() => { setOpenMenu(null); setMenuPosition(null); }} />
      )}
    </div>
  );
}
