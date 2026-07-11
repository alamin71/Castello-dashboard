"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Search, Pencil, Trash2, ChevronDown } from "lucide-react";
import { useProducts } from "@/hooks/queries/useProducts";
import { useUpdateProduct } from "@/hooks/mutations/useUpdateProduct";
import { useDeleteProduct } from "@/hooks/mutations/useDeleteProduct";
import { useCategories } from "@/hooks/queries/useCategories";
import { ProductItem } from "@/types/product.types";

function StatusBadge({ status }: { status: "active" | "inactive" }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border ${
        status === "active"
          ? "border-emerald-500 text-emerald-400"
          : "border-red-500 text-red-400"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          status === "active" ? "bg-emerald-400" : "bg-red-400"
        }`}
      />
      {status === "active" ? "Active" : "Inactive"}
    </span>
  );
}

function PriceCell({ product }: { product: ProductItem }) {
  if (product.type === "single") {
    return (
      <span className="text-sm text-white/70">
        {product.price ? product.price.toLocaleString() : "—"}
      </span>
    );
  }
  if (!product.variants || product.variants.length === 0)
    return <span className="text-sm text-white/40">—</span>;
  return (
    <div className="space-y-0.5">
      {product.variants.map((v, i) => {
        const itemName =
          v.variantItemId !== null && typeof v.variantItemId === "object"
            ? v.variantItemId.name
            : null;
        return (
          <div key={i} className="text-xs text-white/60">
            {itemName && (
              <span className="text-white/40 mr-1">{itemName}</span>
            )}
            {v.price.toLocaleString()}
          </div>
        );
      })}
    </div>
  );
}

function CategoryName({ categoryId }: { categoryId: ProductItem["categoryId"] }) {
  if (typeof categoryId === "object" && categoryId !== null) {
    return <span className="text-sm text-white/70">{categoryId.name}</span>;
  }
  return <span className="text-sm text-white/40">—</span>;
}

function DeleteModal({
  name,
  onConfirm,
  onCancel,
  loading,
}: {
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-[#1a1a1a] rounded-2xl p-6 w-full max-w-sm mx-4 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-2">Delete Product</h3>
        <p className="text-sm text-white/50 mb-6">
          Are you sure you want to delete <span className="text-white font-medium">{name}</span>?
          This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-white/15 text-white text-sm hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 text-sm hover:bg-red-500/30 transition-colors disabled:opacity-50"
          >
            {loading ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "active" | "inactive">("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductItem | null>(null);

  const params = {
    page,
    limit,
    ...(search && { searchTerm: search }),
    ...(categoryFilter && { categoryId: categoryFilter }),
    ...(statusFilter && { status: statusFilter as "active" | "inactive" }),
  };

  const { data, isLoading } = useProducts(params);
  const { data: catData } = useCategories({});
  const { mutate: updateProduct } = useUpdateProduct();
  const { mutate: deleteProduct, isPending: deleting } = useDeleteProduct();

  const products = data?.result ?? [];
  const meta = data?.meta;
  const categories = catData ?? [];

  const handleStatusToggle = (product: ProductItem) => {
    updateProduct({
      id: product._id,
      payload: { status: product.status === "active" ? "inactive" : "active" },
    });
    setOpenMenu(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteProduct(deleteTarget._id, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  const totalPages = meta?.totalPage ?? 1;

  return (
    <div className="p-6 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-white">Products</h1>
        <Link
          href="/menu/products/add"
          className="flex items-center gap-2 bg-white text-black px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-white/90 transition-colors"
        >
          <Plus size={16} />
          Add New Product
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 w-72">
          <Search size={16} className="text-white/30 shrink-0" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search product name..."
            className="bg-transparent text-sm text-white placeholder-white/30 outline-none w-full"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
              className="appearance-none bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 pr-8 text-sm text-white outline-none cursor-pointer focus:border-white/20 scheme-dark"
            >
              <option value="">All Category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value as "" | "active" | "inactive"); setPage(1); }}
              className="appearance-none bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 pr-8 text-sm text-white outline-none cursor-pointer focus:border-white/20 scheme-dark"
            >
              <option value="">All Status</option>
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
              <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">SL</th>
              <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">Product ID</th>
              <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">Photo</th>
              <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">Product Name</th>
              <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">Category</th>
              <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">Type</th>
              <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">Price (Kr.)</th>
              <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">Status</th>
              <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={9} className="px-5 py-10 text-center text-white/30 text-sm">
                  Loading…
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-5 py-10 text-center text-white/30 text-sm">
                  No products found.
                </td>
              </tr>
            ) : (
              products.map((product, idx) => (
                <tr
                  key={product._id}
                  className="border-b border-white/4 hover:bg-white/2 transition-colors"
                >
                  <td className="px-5 py-4 text-sm text-white/40">
                    {(page - 1) * limit + idx + 1}
                  </td>
                  <td className="px-5 py-4 text-sm text-white/60">
                    {product.productId}
                  </td>
                  <td className="px-5 py-4">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/5 flex items-center justify-center">
                      {product.mainImage ? (
                        <Image
                          src={product.mainImage}
                          alt={product.name}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white/20 text-xs">N/A</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div>
                      <p className="text-sm text-white font-medium">{product.name}</p>
                      {product.description && (
                        <p className="text-xs text-white/40 mt-0.5 max-w-60 truncate">
                          {product.description}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <CategoryName categoryId={product.categoryId} />
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border ${
                        product.type === "single"
                          ? "border-blue-500/40 text-blue-400"
                          : "border-purple-500/40 text-purple-400"
                      }`}
                    >
                      {product.type === "single" ? "Single" : "Variant"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <PriceCell product={product} />
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={product.status} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1 relative">
                      <Link
                        href={`/menu/products/${product._id}/edit`}
                        className="p-1.5 text-white/40 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                      >
                        <Pencil size={15} />
                      </Link>
                      <button
                        onClick={() => setOpenMenu(openMenu === product._id ? null : product._id)}
                        className="p-1.5 text-white/40 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                      >
                        <Trash2 size={15} />
                      </button>
                      {openMenu === product._id && (
                        <div className="absolute right-0 top-8 z-20 bg-[#232323] border border-white/10 rounded-xl shadow-xl min-w-36 py-1">
                          <button
                            onClick={() => handleStatusToggle(product)}
                            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-white/70 hover:bg-white/5 transition-colors"
                          >
                            <span
                              className={`w-3 h-3 rounded-full border-2 ${
                                product.status === "active"
                                  ? "border-red-400"
                                  : "border-emerald-400"
                              }`}
                            />
                            {product.status === "active" ? "Set Inactive" : "Set Active"}
                          </button>
                          <button
                            onClick={() => { setDeleteTarget(product); setOpenMenu(null); }}
                            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-white/5 transition-colors"
                          >
                            <Trash2 size={13} /> Delete
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

      {/* Pagination */}
      <div className="flex items-center justify-between mt-5">
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

      {deleteTarget && (
        <DeleteModal
          name={deleteTarget.name}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}

      {openMenu !== null && (
        <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
      )}
    </div>
  );
}
