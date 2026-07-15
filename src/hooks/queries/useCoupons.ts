import { useQuery } from "@tanstack/react-query";
import { couponService } from "@/services/coupon.service";
import { CouponListParams } from "@/types/coupon.types";

export function useCoupons(params: CouponListParams = {}) {
  return useQuery({
    queryKey: ["coupons", params],
    queryFn: () => couponService.list(params),
  });
}
