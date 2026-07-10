import { useMutation } from "@tanstack/react-query";
import { categoryService } from "@/services/category.service";

export function useReorderCategories() {
  return useMutation({
    mutationFn: (orderedIds: string[]) => categoryService.reorder(orderedIds),
  });
}
