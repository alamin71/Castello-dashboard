import { useMutation } from "@tanstack/react-query";
import { offerCategoryService } from "@/services/offer-category.service";

export function useReorderOfferCategories() {
  return useMutation({
    mutationFn: (orderedIds: string[]) => offerCategoryService.reorder(orderedIds),
  });
}
