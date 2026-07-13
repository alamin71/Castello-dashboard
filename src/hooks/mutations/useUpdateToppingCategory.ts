import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toppingService } from "@/services/topping.service";
import { UpdateToppingCategoryPayload } from "@/types/topping.types";
import { toast } from "@/store/toast.store";

export function useUpdateToppingCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateToppingCategoryPayload }) =>
      toppingService.updateCategory(id, payload),
    onSuccess: () => {
      toast.success("Topping category updated successfully");
      queryClient.invalidateQueries({ queryKey: ["topping-categories"] });
    },
  });
}
