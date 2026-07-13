import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toppingService } from "@/services/topping.service";
import { UpdateToppingItemPayload } from "@/types/topping.types";
import { toast } from "@/store/toast.store";

export function useUpdateToppingItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateToppingItemPayload }) =>
      toppingService.updateItem(id, payload),
    onSuccess: () => {
      toast.success("Topping item updated successfully");
      queryClient.invalidateQueries({ queryKey: ["topping-items"] });
    },
  });
}
