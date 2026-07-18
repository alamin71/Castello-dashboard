import { useMutation, useQueryClient } from "@tanstack/react-query";
import { offerCategoryService } from "@/services/offer-category.service";
import { UpdateOfferCategoryPayload } from "@/types/offer-category.types";
import { toast } from "@/store/toast.store";

export function useUpdateOfferCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateOfferCategoryPayload }) =>
      offerCategoryService.update(id, payload),
    onSuccess: () => {
      toast.success("Offer category updated successfully");
      queryClient.invalidateQueries({ queryKey: ["offer-categories"] });
    },
    onError: () => {
      toast.error("Failed to update offer category");
    },
  });
}
