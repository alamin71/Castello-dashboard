import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toppingService } from "@/services/topping.service";
import { toast } from "@/store/toast.store";

export function useDeleteToppingItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => toppingService.deleteItem(id),
    onSuccess: () => {
      toast.success("Topping item deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["topping-items"] });
    },
  });
}
