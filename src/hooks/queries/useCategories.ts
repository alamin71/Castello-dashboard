import { useQuery } from "@tanstack/react-query";
import { categoryService } from "@/services/category.service";
import { CategoryListParams, CategoryListResponse } from "@/types/category.types";

export function useCategories(params: CategoryListParams) {
  return useQuery({
    queryKey: ["categories", params],
    queryFn: () => categoryService.list(params),
  });
}
