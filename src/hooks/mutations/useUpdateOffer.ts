import { useMutation, useQueryClient } from "@tanstack/react-query";
import { offerService } from "@/services/offer.service";
import { UpdateOfferPayload } from "@/types/offer.types";
import { toast } from "@/store/toast.store";

export function useUpdateOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateOfferPayload }) =>
      offerService.update(id, payload),
    onSuccess: (_, { id }) => {
      toast.success("Offer updated successfully");
      queryClient.invalidateQueries({ queryKey: ["offers"] });
      queryClient.invalidateQueries({ queryKey: ["offer", id] });
    },
  });
}
