import { useQuery } from "@tanstack/react-query";
import { offerService } from "@/services/offer.service";
import { OfferListParams } from "@/types/offer.types";

export function useOffers(params: OfferListParams = {}) {
  return useQuery({
    queryKey: ["offers", params],
    queryFn: () => offerService.list(params),
  });
}
