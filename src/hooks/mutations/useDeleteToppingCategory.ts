import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toppingService } from "@/services/topping.service";
import { toast } from "@/store/toast.store";

export function useDeleteToppingCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => toppingService.deleteCategory(id),
    onSuccess: () => {
      toast.success("Topping category deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["topping-categories"] });
    },
  });
}
