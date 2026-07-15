import { useMutation, useQueryClient } from "@tanstack/react-query";
import { couponService } from "@/services/coupon.service";
import { toast } from "@/store/toast.store";

export function useDeleteCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => couponService.delete(id),
    onSuccess: () => {
      toast.success("Coupon deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
    },
    onError: () => {
      toast.error("Failed to delete coupon");
    },
  });
}
