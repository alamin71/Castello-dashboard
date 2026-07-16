import { useMutation, useQueryClient } from "@tanstack/react-query";
import { discountService } from "@/services/discount.service";
import { UpdateDiscountPayload } from "@/types/discount.types";
import { toast } from "@/store/toast.store";

export function useUpdateDiscount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateDiscountPayload }) =>
      discountService.update(id, payload),
    onSuccess: () => {
      toast.success("Discount updated successfully");
      queryClient.invalidateQueries({ queryKey: ["discounts"] });
    },
    onError: () => {
      toast.error("Failed to update discount");
    },
  });
}
