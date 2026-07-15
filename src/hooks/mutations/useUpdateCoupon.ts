import { useMutation, useQueryClient } from "@tanstack/react-query";
import { couponService } from "@/services/coupon.service";
import { UpdateCouponPayload } from "@/types/coupon.types";
import { toast } from "@/store/toast.store";

export function useUpdateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCouponPayload }) =>
      couponService.update(id, payload),
    onSuccess: () => {
      toast.success("Coupon updated successfully");
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
    },
    onError: () => {
      toast.error("Failed to update coupon");
    },
  });
}
