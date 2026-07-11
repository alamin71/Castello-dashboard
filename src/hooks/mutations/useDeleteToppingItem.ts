import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toppingService } from "@/services/topping.service";

export function useDeleteToppingItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => toppingService.deleteItem(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["topping-items"] }),
  });
}
