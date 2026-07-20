"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Plus, Search, Pencil, MoreVertical, ChevronDown, Trash2, Ban, CircleCheck, CloudUpload, X, GripVertical } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useOfferCategories } from "@/hooks/queries/useOfferCategories";
import { useCreateOfferCategory } from "@/hooks/mutations/useCreateOfferCategory";
import { useUpdateOfferCategory } from "@/hooks/mutations/useUpdateOfferCategory";
import { useDeleteOfferCategory } from "@/hooks/mutations/useDeleteOfferCategory";
import { useReorderOfferCategories } from "@/hooks/mutations/useReorderOfferCategories";
import { OfferCategoryItem } from "@/types/offer-category.types";

type Status = "active" | "inactive";

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

function SkeletonRow() {
  return (
    <tr className="border-b border-white/4">
      <td className="px-5 py-4"><div className="skeleton h-4 w-8 rounded" /></td>
      <td className="px-5 py-4"><div className="skeleton h-4 w-24 rounded" /></td>
      <td className="px-5 py-4"><div className="skeleton w-10 h-10 rounded-xl" /></td>
      <td className="px-5 py-4"><div className="skeleton h-4 w-36 rounded" /></td>
      <td className="px-5 py-4"><div className="skeleton h-4 w-10 rounded" /></td>
      <td className="px-5 py-4"><div className="skeleton h-6 w-20 rounded-full" /></td>
      <td className="px-5 py-4"><div className="flex gap-1"><div className="skeleton w-7 h-7 rounded-lg" /><div className="skeleton w-7 h-7 rounded-lg" /></div></td>
    </tr>
  );
}

function CategoryModal({
  initial,
  onClose,
}: {
  initial?: OfferCategoryItem;
  onClose: () => void;
}) {
  const isEdit = !!initial;
  const [name, setName] = useState(initial?.name ?? "");
  const [status, setStatus] = useState<Status>(initial?.status ?? "active");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initial?.image ?? null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { mutate: create, isPending: isCreating } = useCreateOfferCategory();
  const { mutate: update, isPending: isUpdating } = useUpdateOfferCategory();
  const isPending = isCreating || isUpdating;

  const handleImage = (file: File) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = () => {
    setError(null);
    if (!name.trim()) return setError("Category name is required.");
    if (!isEdit && !imageFile) return setError("Category photo is required.");

    const handleApiError = (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || (isEdit ? "Failed to update category" : "Failed to create category"));
    };

    if (isEdit) {
      update(
        { id: initial!._id, payload: { name: name.trim(), ...(imageFile ? { image: imageFile } : {}), status } },
        { onSuccess: onClose, onError: handleApiError }
      );
    } else {
      create({ name: name.trim(), image: imageFile! }, { onSuccess: onClose, onError: handleApiError });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-[#1a1a1a] rounded-2xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">{isEdit ? "Edit Category" : "Add New Category"}</h2>
          <button onClick={onClose} className="text-red-400 hover:text-red-300 transition-colors"><X size={20} /></button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {error && <p className="text-sm text-red-400 bg-red-400/10 rounded-xl px-4 py-3">{error}</p>}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white"><span className="text-red-400">*</span> Category Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter category name"
              className="w-full bg-transparent border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-white transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white">
              {!isEdit && <span className="text-red-400">*</span>} Category Photo
            </label>
            <div
              onClick={() => fileRef.current?.click()}
              className="relative flex items-center justify-center border border-dashed border-white/15 rounded-xl cursor-pointer hover:border-white/30 transition-colors overflow-hidden"
            >
              {imagePreview ? (
                <div className="relative w-full h-40">
                  <Image src={imagePreview} alt="Preview" fill className="object-contain p-4" unoptimized />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setImageFile(null); setImagePreview(isEdit ? initial!.image : null); if (fileRef.current) fileRef.current.value = ""; }}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors z-10"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <CloudUpload size={28} className="mx-auto text-white/30 mb-2" />
                  <p className="text-sm text-white/40">Click to upload image</p>
                  <p className="text-xs text-white/25 mt-1">SVG, PNG, JPG</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImage(f); }} />
          </div>

          {isEdit && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white">Status</label>
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Status)}
                  className="w-full appearance-none bg-transparent border border-white/10 rounded-xl px-4 py-3 pr-10 text-sm text-white outline-none focus:border-white transition-colors scheme-dark cursor-pointer"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
              </div>
            </div>
          )}
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/15 text-white text-sm font-medium hover:bg-white/5 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="flex-1 py-3 rounded-xl bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Saving..." : isEdit ? "Save Changes" : "Add Category"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteModal({ category, onClose }: { category: OfferCategoryItem; onClose: () => void }) {
  const { mutate: deleteCategory, isPending } = useDeleteOfferCategory();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-[#1a1a1a] rounded-2xl w-full max-w-md mx-4 p-6">
        <h2 className="text-lg font-semibold text-white mb-2">Delete Offer Category</h2>
        <p className="text-sm text-white/60 mb-6">
          Are you sure you want to delete <span className="text-white font-medium">{category.name}</span>? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/15 text-white text-sm font-medium hover:bg-white/5 transition-colors">Cancel</button>
          <button
            onClick={() => deleteCategory(category._id, { onSuccess: onClose })}
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

export default function OfferCategoriesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top?: number; bottom?: number; right: number } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editCategory, setEditCategory] = useState<OfferCategoryItem | null>(null);
  const [deleteCategory, setDeleteCategory] = useState<OfferCategoryItem | null>(null);

  // drag-and-drop reorder state
  const [localOrder, setLocalOrder] = useState<OfferCategoryItem[] | null>(null);
  const dragIndexRef = useRef<number | null>(null);
  const pendingReorderRef = useRef(false);

  const queryClient = useQueryClient();
  const { mutate: reorderCategories } = useReorderOfferCategories();

  const params = {
    page,
    limit,
    ...(search ? { searchTerm: search } : {}),
    ...(statusFilter !== "all" ? { status: statusFilter } : {}),
  };

  const { data, isLoading, isError } = useOfferCategories(params);
  const { mutate: updateCategory } = useUpdateOfferCategory();

  useEffect(() => {
    if (pendingReorderRef.current && data) {
      setLocalOrder(null);
      pendingReorderRef.current = false;
    }
  }, [data]);

  const categories = localOrder ?? data?.result ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPage ?? 1;

  const toggleStatus = (cat: OfferCategoryItem) => {
    const newStatus: Status = cat.status === "active" ? "inactive" : "active";
    updateCategory({ id: cat._id, payload: { status: newStatus } });
    setOpenMenu(null);
  };

  const handleDragStart = (idx: number) => { dragIndexRef.current = idx; };

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
        pendingReorderRef.current = true;
        queryClient.invalidateQueries({ queryKey: ["offer-categories"] });
      },
      onError: () => setLocalOrder(null),
    });
  };

  const openMenuAt = (id: string, e: React.MouseEvent<HTMLButtonElement>) => {
    if (openMenu === id) { setOpenMenu(null); return; }
    const rect = e.currentTarget.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    setMenuPosition(
      spaceBelow < 140
        ? { bottom: window.innerHeight - rect.top + 4, right: window.innerWidth - rect.right }
        : { top: rect.bottom + 4, right: window.innerWidth - rect.right }
    );
    setOpenMenu(id);
  };

  return (
    <div className="flex flex-col h-full p-6">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-white">Offer Categories</h1>
        <button
          onClick={() => { setEditCategory(null); setShowModal(true); }}
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
                <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">Assigned Offer</th>
                <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider rounded-tr-2xl">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
              ) : isError ? (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-red-400">Failed to load categories.</td></tr>
              ) : categories.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-white/40">No offer categories found.</td></tr>
              ) : (
                categories.map((cat, idx) => (
                  <tr
                    key={cat._id}
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDrop={handleDrop}
                    className="border-b border-white/4 hover:bg-white/2 transition-colors cursor-grab active:cursor-grabbing"
                  >
                    <td className="px-5 py-4 text-sm text-white/60">{String((page - 1) * limit + idx + 1).padStart(2, "0")}</td>
                    <td className="px-5 py-4 text-sm text-white/60">{cat.offerCategoryId}</td>
                    <td className="px-5 py-4">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/5 shrink-0 relative">
                        {cat.image ? (
                          <Image src={cat.image} alt={cat.name} fill className="object-cover" unoptimized />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/30 text-xs font-medium">
                            {cat.name[0]}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-white font-medium">{cat.name}</td>
                    <td className="px-5 py-4 text-sm text-white/60">{String(cat.assignedOffers ?? 0).padStart(2, "0")}</td>
                    <td className="px-5 py-4"><StatusBadge status={cat.status} /></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setEditCategory(cat); setShowModal(true); }}
                          className="p-1.5 text-white/40 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={(e) => openMenuAt(cat._id, e)}
                          className="p-1.5 text-white/40 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                        >
                          <MoreVertical size={15} />
                        </button>
                        {openMenu === cat._id && menuPosition && (
                          <div
                            style={{ top: menuPosition.top, bottom: menuPosition.bottom, right: menuPosition.right }}
                            className="fixed z-9999 bg-[#1e1e1e] border border-white/10 rounded-2xl shadow-2xl w-44 overflow-hidden"
                          >
                            <button
                              onClick={() => toggleStatus(cat)}
                              className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-medium transition-colors ${
                                cat.status === "active" ? "text-red-400 hover:bg-red-400/8" : "text-emerald-400 hover:bg-emerald-400/8"
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
                        <button
                          title="Drag to reorder"
                          className="p-1.5 text-white/30 cursor-grab active:cursor-grabbing rounded-lg hover:bg-white/5"
                          onMouseDown={(e) => e.stopPropagation()}
                        >
                          <GripVertical size={15} />
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
      <div className="shrink-0 flex items-center justify-between mt-5">
        <div className="flex items-center gap-2 text-sm text-white/40">
          <span>Showing per page</span>
          <div className="relative">
            <select
              value={limit}
              onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
              className="appearance-none bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-1.5 pr-7 text-sm text-white outline-none scheme-dark"
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
                p === page ? "bg-white text-black font-medium" : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              {String(p).padStart(2, "0")}
            </button>
          ))}
        </div>
      </div>

      {showModal && (
        <CategoryModal
          initial={editCategory ?? undefined}
          onClose={() => { setShowModal(false); setEditCategory(null); }}
        />
      )}
      {deleteCategory && <DeleteModal category={deleteCategory} onClose={() => setDeleteCategory(null)} />}
      {openMenu !== null && (
        <div className="fixed inset-0 z-9998" onClick={() => { setOpenMenu(null); setMenuPosition(null); }} />
      )}
    </div>
  );
}
