"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import OfferForm from "../_components/OfferForm";

export default function CreateOfferPage() {
  return (
    <div className="p-6 min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/promotions/special-offer" className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors">
          <ChevronLeft size={18} />
        </Link>
        <h1 className="text-2xl font-semibold text-white">Create New Offer</h1>
      </div>
      <OfferForm />
    </div>
  );
}
