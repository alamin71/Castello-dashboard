import { useMutation, useQueryClient } from "@tanstack/react-query";
import { offerCategoryService } from "@/services/offer-category.service";
import { CreateOfferCategoryPayload } from "@/types/offer-category.types";
import { toast } from "@/store/toast.store";

export function useCreateOfferCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOfferCategoryPayload) => offerCategoryService.create(payload),
    onSuccess: () => {
      toast.success("Offer category created successfully");
      queryClient.invalidateQueries({ queryKey: ["offer-categories"] });
    },
    onError: () => {
      toast.error("Failed to create offer category");
    },
  });
}
