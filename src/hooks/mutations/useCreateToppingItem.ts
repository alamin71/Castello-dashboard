import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toppingService } from "@/services/topping.service";
import { CreateToppingItemPayload } from "@/types/topping.types";

export function useCreateToppingItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateToppingItemPayload) => toppingService.createItem(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["topping-items"] }),
  });
}
