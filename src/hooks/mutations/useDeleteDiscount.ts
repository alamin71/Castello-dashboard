import { useMutation, useQueryClient } from "@tanstack/react-query";
import { discountService } from "@/services/discount.service";
import { toast } from "@/store/toast.store";

export function useDeleteDiscount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => discountService.delete(id),
    onSuccess: () => {
      toast.success("Discount deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["discounts"] });
    },
    onError: () => {
      toast.error("Failed to delete discount");
    },
  });
}
