import { useMutation, useQueryClient } from "@tanstack/react-query";
import { offerService } from "@/services/offer.service";
import { CreateOfferPayload } from "@/types/offer.types";
import { toast } from "@/store/toast.store";

export function useCreateOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOfferPayload) => offerService.create(payload),
    onSuccess: () => {
      toast.success("Offer created successfully");
      queryClient.invalidateQueries({ queryKey: ["offers"] });
    },
  });
}
