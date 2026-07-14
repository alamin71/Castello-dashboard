import { useQuery } from "@tanstack/react-query";
import { offerService } from "@/services/offer.service";

export function useOffer(id: string) {
  return useQuery({
    queryKey: ["offer", id],
    queryFn: () => offerService.getById(id),
    enabled: !!id,
  });
}
