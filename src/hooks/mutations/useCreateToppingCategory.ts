import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toppingService } from "@/services/topping.service";
import { CreateToppingCategoryPayload } from "@/types/topping.types";

export function useCreateToppingCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateToppingCategoryPayload) => toppingService.createCategory(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["topping-categories"] }),
  });
}
