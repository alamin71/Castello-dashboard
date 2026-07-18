"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Search, Pencil, MoreVertical, ChevronDown, Trash2, Ban, CircleCheck } from "lucide-react";
import { useOffers } from "@/hooks/queries/useOffers";
import { useUpdateOffer } from "@/hooks/mutations/useUpdateOffer";
import { useDeleteOffer } from "@/hooks/mutations/useDeleteOffer";
import { useCategories } from "@/hooks/queries/useCategories";
import { useOfferCategories } from "@/hooks/queries/useOfferCategories";
import { OfferItem } from "@/types/offer.types";

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

function AvailabilityBadges({ availability }: { availability: { website: boolean; pos: boolean; kiosk: boolean } }) {
  const items = [
    { key: "website", label: "Web" },
    { key: "pos",     label: "POS" },
    { key: "kiosk",   label: "Kiosk" },
  ] as const;
  return (
    <div className="flex gap-1 flex-wrap">
      {items.map(({ key, label }) => (
        <span
          key={key}
          className={`px-2 py-0.5 rounded-md text-xs font-medium border ${
            availability[key]
              ? "border-white/20 text-white/70 bg-white/5"
              : "border-white/6 text-white/20"
          }`}
        >
          {label}
        </span>
      ))}
    </div>
  );
}

function OfferSkeletonRow() {
  return (
    <tr className="border-b border-white/4">
      <td className="px-5 py-4"><div className="skeleton h-4 w-20 rounded" /></td>
      <td className="px-5 py-4"><div className="skeleton w-10 h-10 rounded-xl" /></td>
      <td className="px-5 py-4">
        <div className="space-y-1.5">
          <div className="skeleton h-4 w-40 rounded" />
          <div className="skeleton h-3 w-56 rounded" />
        </div>
      </td>
      <td className="px-5 py-4"><div className="skeleton h-4 w-24 rounded" /></td>
      <td className="px-5 py-4"><div className="skeleton h-4 w-32 rounded" /></td>
      <td className="px-5 py-4"><div className="skeleton h-4 w-8 rounded" /></td>
      <td className="px-5 py-4"><div className="skeleton h-4 w-16 rounded" /></td>
      <td className="px-5 py-4"><div className="skeleton h-6 w-20 rounded-full" /></td>
      <td className="px-5 py-4"><div className="flex gap-1"><div className="skeleton h-5 w-10 rounded-md" /><div className="skeleton h-5 w-10 rounded-md" /><div className="skeleton h-5 w-12 rounded-md" /></div></td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-1">
          <div className="skeleton w-7 h-7 rounded-lg" />
          <div className="skeleton w-7 h-7 rounded-lg" />
        </div>
      </td>
    </tr>
  );
}

function DeleteConfirmModal({ offer, onClose }: { offer: OfferItem; onClose: () => void }) {
  const { mutate: deleteOffer, isPending } = useDeleteOffer();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-[#1a1a1a] rounded-2xl w-full max-w-md mx-4 p-6">
        <h2 className="text-lg font-semibold text-white mb-2">Delete Offer</h2>
        <p className="text-sm text-white/60 mb-6">
          Are you sure you want to delete <span className="text-white font-medium">{offer.title}</span>? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/15 text-white text-sm font-medium hover:bg-white/5 transition-colors">Cancel</button>
          <button onClick={() => deleteOffer(offer._id, { onSuccess: () => onClose() })} disabled={isPending}
            className="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {isPending ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SpecialOfferPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");
  const [availabilityFilter, setAvailabilityFilter] = useState<"all" | "website" | "pos" | "kiosk">("all");
  const [offerCategoryFilter, setOfferCategoryFilter] = useState("all");
  const [productCategoryFilter, setProductCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top?: number; bottom?: number; right: number } | null>(null);
  const [deleteOffer, setDeleteOffer] = useState<OfferItem | null>(null);

  const params = {
    page,
    limit,
    ...(search ? { searchTerm: search } : {}),
    ...(statusFilter !== "all" ? { status: statusFilter } : {}),
    ...(availabilityFilter !== "all" ? { availability: availabilityFilter } : {}),
    ...(offerCategoryFilter !== "all" ? { offerCategoryId: offerCategoryFilter } : {}),
    ...(productCategoryFilter !== "all" ? { productCategoryId: productCategoryFilter } : {}),
  };

  const { data, isLoading, isError } = useOffers(params);
  const { data: catData } = useCategories({});
  const { data: offerCatData } = useOfferCategories({ limit: 100 });
  const { mutate: updateOffer } = useUpdateOffer();

  const offers = data?.result ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPage ?? 1;

  const productCatMap = new Map((catData?.result ?? []).map((c) => [c._id, c.name]));
  const offerCatMap = new Map((offerCatData?.result ?? []).map((c) => [c._id, c.name]));

  const getProductCategoryName = (catId: string | { _id: string; name: string }): string | undefined => {
    if (typeof catId === "object" && catId.name) return catId.name;
    const id = typeof catId === "string" ? catId : catId._id;
    return productCatMap.get(id);
  };

  const getOfferCategoryName = (val: string | { _id: string; name: string } | undefined): string | undefined => {
    if (!val) return undefined;
    if (typeof val === "object" && val.name) return val.name;
    const id = typeof val === "string" ? val : val._id;
    return offerCatMap.get(id);
  };

  const toggleStatus = (offer: OfferItem) => {
    const newStatus: Status = offer.status === "active" ? "inactive" : "active";
    updateOffer({ id: offer._id, payload: { status: newStatus } });
    setOpenMenu(null);
  };

  const openMenuAt = (id: string, e: React.MouseEvent<HTMLButtonElement>) => {
    if (openMenu === id) { setOpenMenu(null); return; }
    const rect = e.currentTarget.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    setMenuPosition(
      spaceBelow < 160
        ? { bottom: window.innerHeight - rect.top + 4, right: window.innerWidth - rect.right }
        : { top: rect.bottom + 4, right: window.innerWidth - rect.right }
    );
    setOpenMenu(id);
  };

  return (
    <div className="flex flex-col h-full p-6">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-white">Offers</h1>
        <Link
          href="/promotions/special-offer/add"
          className="flex items-center gap-2 bg-white text-black px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-white/90 transition-colors"
        >
          <Plus size={16} />
          Add New Offer
        </Link>
      </div>

      {/* Filters */}
      <div className="shrink-0 flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 w-72 focus-within:border-white transition-colors">
          <Search size={16} className="text-white/30 shrink-0" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search offer name..."
            className="bg-transparent text-sm text-white placeholder-white/30 outline-none w-full"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={availabilityFilter}
              onChange={(e) => { setAvailabilityFilter(e.target.value as "all" | "website" | "pos" | "kiosk"); setPage(1); }}
              className="appearance-none bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 pr-8 text-sm text-white outline-none cursor-pointer focus:border-white scheme-dark"
            >
              <option value="all">All Availability</option>
              <option value="website">Website</option>
              <option value="pos">POS</option>
              <option value="kiosk">Kiosk</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={offerCategoryFilter}
              onChange={(e) => { setOfferCategoryFilter(e.target.value); setPage(1); }}
              className="appearance-none bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 pr-8 text-sm text-white outline-none cursor-pointer focus:border-white scheme-dark"
            >
              <option value="all">Offer Category</option>
              {(offerCatData?.result ?? []).map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={productCategoryFilter}
              onChange={(e) => { setProductCategoryFilter(e.target.value); setPage(1); }}
              className="appearance-none bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 pr-8 text-sm text-white outline-none cursor-pointer focus:border-white scheme-dark"
            >
              <option value="all">Product Category</option>
              {(catData?.result ?? []).map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
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
      </div>

      {/* Table */}
      <div className="flex-1 min-h-0 bg-[#1a1a1a] rounded-2xl overflow-hidden border border-white/6">
        <div className="h-full overflow-y-auto" onScroll={() => openMenu !== null && setOpenMenu(null)}>
          <table className="w-full">
            <thead className="sticky top-0 z-10 bg-[#1a1a1a]">
              <tr className="border-b border-white/6">
                <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider rounded-tl-2xl">Offer ID</th>
                <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">Photo</th>
                <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">Offer Name</th>
                <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">Offer Category</th>
                <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">Product Category</th>
                <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">Items</th>
                <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">Price (Kr.)</th>
                <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">Availability</th>
                <th className="text-left px-5 py-4 text-xs font-medium text-white/40 uppercase tracking-wider rounded-tr-2xl">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => <OfferSkeletonRow key={i} />)
              ) : isError ? (
                <tr>
                  <td colSpan={10} className="px-5 py-12 text-center text-sm text-red-400">Failed to load offers. Please try again.</td>
                </tr>
              ) : offers.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-5 py-12 text-center text-sm text-white/40">No offers found.</td>
                </tr>
              ) : (
                offers.map((offer) => {
                  const productCategoryNames = offer.offerItems
                    .map((item) => getProductCategoryName(item.categoryId))
                    .filter(Boolean) as string[];
                  const offerCatName = getOfferCategoryName(offer.offerCategoryId);

                  return (
                    <tr key={offer._id} className="border-b border-white/4 hover:bg-white/2 transition-colors">
                      <td className="px-5 py-4 text-sm text-white/60">{offer.offerId}</td>
                      <td className="px-5 py-4">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/5 shrink-0 relative">
                          {offer.mainImage ? (
                            <Image src={offer.mainImage} alt={offer.title} fill className="object-cover" unoptimized />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/30 text-xs font-medium">
                              {offer.title[0]}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm text-white font-medium max-w-48 truncate">{offer.title}</p>
                        {offer.description && (
                          <p className="text-xs text-white/40 mt-0.5 max-w-48 truncate">{offer.description}</p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {offerCatName ? (
                          <span className="px-2 py-0.5 bg-white/6 border border-white/10 rounded-lg text-xs text-white/60">
                            {offerCatName}
                          </span>
                        ) : (
                          <span className="text-xs text-white/30">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1">
                          {productCategoryNames.length > 0 ? productCategoryNames.map((name) => (
                            <span key={name} className="px-2 py-0.5 bg-white/6 border border-white/10 rounded-lg text-xs text-white/60">
                              {name}
                            </span>
                          )) : (
                            <span className="text-xs text-white/30">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-white/60">
                        {String(offer.totalItems ?? offer.offerItems.length).padStart(2, "0")}
                      </td>
                      <td className="px-5 py-4 text-sm text-white/70">{offer.price.toLocaleString()}</td>
                      <td className="px-5 py-4"><StatusBadge status={offer.status} /></td>
                      <td className="px-5 py-4"><AvailabilityBadges availability={offer.availability} /></td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <Link
                            href={`/promotions/special-offer/${offer._id}/edit`}
                            className="p-1.5 text-white/40 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                          >
                            <Pencil size={15} />
                          </Link>
                          <button
                            onClick={(e) => openMenuAt(offer._id, e)}
                            className="p-1.5 text-white/40 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                          >
                            <MoreVertical size={15} />
                          </button>
                          {openMenu === offer._id && menuPosition && (
                            <div
                              style={{ top: menuPosition.top, bottom: menuPosition.bottom, right: menuPosition.right }}
                              className="fixed z-9999 bg-[#1e1e1e] border border-white/10 rounded-2xl shadow-2xl w-44 overflow-hidden"
                            >
                              <button
                                onClick={() => toggleStatus(offer)}
                                className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-medium transition-colors ${
                                  offer.status === "active" ? "text-red-400 hover:bg-red-400/8" : "text-emerald-400 hover:bg-emerald-400/8"
                                }`}
                              >
                                {offer.status === "active" ? <Ban size={16} /> : <CircleCheck size={16} />}
                                {offer.status === "active" ? "Inactive" : "Active"}
                              </button>
                              <div className="mx-4 h-px bg-white/8" />
                              <button
                                onClick={() => { setDeleteOffer(offer); setOpenMenu(null); }}
                                className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-400/8 transition-colors"
                              >
                                <Trash2 size={16} /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
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

      {deleteOffer && <DeleteConfirmModal offer={deleteOffer} onClose={() => setDeleteOffer(null)} />}

      {openMenu !== null && (
        <div className="fixed inset-0 z-9998" onClick={() => { setOpenMenu(null); setMenuPosition(null); }} />
      )}
    </div>
  );
}
