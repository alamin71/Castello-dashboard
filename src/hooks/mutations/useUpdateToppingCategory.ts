import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toppingService } from "@/services/topping.service";
import { UpdateToppingCategoryPayload } from "@/types/topping.types";

export function useUpdateToppingCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateToppingCategoryPayload }) =>
      toppingService.updateCategory(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["topping-categories"] }),
  });
}
