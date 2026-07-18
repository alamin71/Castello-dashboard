import { useMutation, useQueryClient } from "@tanstack/react-query";
import { offerCategoryService } from "@/services/offer-category.service";
import { toast } from "@/store/toast.store";

export function useDeleteOfferCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => offerCategoryService.delete(id),
    onSuccess: () => {
      toast.success("Offer category deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["offer-categories"] });
    },
    onError: () => {
      toast.error("Failed to delete offer category");
    },
  });
}
