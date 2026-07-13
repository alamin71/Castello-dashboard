import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toppingService } from "@/services/topping.service";
import { CreateToppingCategoryPayload } from "@/types/topping.types";
import { toast } from "@/store/toast.store";

export function useCreateToppingCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateToppingCategoryPayload) => toppingService.createCategory(payload),
    onSuccess: () => {
      toast.success("Topping category created successfully");
      queryClient.invalidateQueries({ queryKey: ["topping-categories"] });
    },
  });
}
