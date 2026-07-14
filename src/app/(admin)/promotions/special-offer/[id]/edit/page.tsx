"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useOffer } from "@/hooks/queries/useOffer";
import OfferForm from "../../_components/OfferForm";

export default function EditOfferPage() {
  const { id } = useParams<{ id: string }>();
  const { data: offer, isLoading, isError } = useOffer(id);

  return (
    <div className="p-6 min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/promotions/special-offer" className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors">
          <ChevronLeft size={18} />
        </Link>
        <h1 className="text-2xl font-semibold text-white">Edit Offer</h1>
      </div>

      {isLoading ? (
        <div className="flex gap-6">
          <div className="flex-1 space-y-4">
            <div className="skeleton h-12 rounded-xl" />
            <div className="skeleton h-28 rounded-xl" />
            <div className="skeleton h-12 rounded-xl w-1/3" />
            <div className="skeleton h-24 rounded-xl" />
          </div>
          <div className="w-65 shrink-0 space-y-4">
            <div className="skeleton aspect-square rounded-xl" />
            <div className="skeleton h-20 rounded-xl" />
          </div>
        </div>
      ) : isError || !offer ? (
        <div className="text-center py-20 text-red-400 text-sm">Failed to load offer.</div>
      ) : (
        <OfferForm initialData={offer} offerId={offer._id} />
      )}
    </div>
  );
}
