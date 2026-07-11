import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toppingService } from "@/services/topping.service";

export function useDeleteToppingCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => toppingService.deleteCategory(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["topping-categories"] }),
  });
}
