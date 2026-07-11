import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toppingService } from "@/services/topping.service";
import { UpdateToppingItemPayload } from "@/types/topping.types";

export function useUpdateToppingItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateToppingItemPayload }) =>
      toppingService.updateItem(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["topping-items"] }),
  });
}
