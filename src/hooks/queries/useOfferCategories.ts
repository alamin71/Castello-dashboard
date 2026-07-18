import { useQuery } from "@tanstack/react-query";
import { offerCategoryService } from "@/services/offer-category.service";
import { OfferCategoryListParams } from "@/types/offer-category.types";

export function useOfferCategories(params: OfferCategoryListParams = {}) {
  return useQuery({
    queryKey: ["offer-categories", params],
    queryFn: () => offerCategoryService.list(params),
  });
}
