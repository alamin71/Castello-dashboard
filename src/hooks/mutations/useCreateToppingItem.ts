import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toppingService } from "@/services/topping.service";
import { CreateToppingItemPayload } from "@/types/topping.types";
import { toast } from "@/store/toast.store";

export function useCreateToppingItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateToppingItemPayload) => toppingService.createItem(payload),
    onSuccess: () => {
      toast.success("Topping item created successfully");
      queryClient.invalidateQueries({ queryKey: ["topping-items"] });
    },
  });
}
