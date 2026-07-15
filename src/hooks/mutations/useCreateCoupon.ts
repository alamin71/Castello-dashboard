import { useMutation, useQueryClient } from "@tanstack/react-query";
import { couponService } from "@/services/coupon.service";
import { CreateCouponPayload } from "@/types/coupon.types";
import { toast } from "@/store/toast.store";

export function useCreateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCouponPayload) => couponService.create(payload),
    onSuccess: () => {
      toast.success("Coupon created successfully");
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
    },
    onError: () => {
      toast.error("Failed to create coupon");
    },
  });
}
