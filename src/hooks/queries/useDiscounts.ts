import { useQuery } from "@tanstack/react-query";
import { discountService } from "@/services/discount.service";
import { DiscountListParams } from "@/types/discount.types";

export function useDiscounts(params: DiscountListParams = {}) {
  return useQuery({
    queryKey: ["discounts", params],
    queryFn: () => discountService.list(params),
  });
}
