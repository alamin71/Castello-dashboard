import { useMutation, useQueryClient } from "@tanstack/react-query";
import { discountService } from "@/services/discount.service";
import { CreateDiscountPayload } from "@/types/discount.types";
import { toast } from "@/store/toast.store";

export function useCreateDiscount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDiscountPayload) => discountService.create(payload),
    onSuccess: () => {
      toast.success("Discount created successfully");
      queryClient.invalidateQueries({ queryKey: ["discounts"] });
    },
    onError: () => {
      toast.error("Failed to create discount");
    },
  });
}
