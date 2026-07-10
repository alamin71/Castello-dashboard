import { useQuery } from "@tanstack/react-query";
import { variantService } from "@/services/variant.service";
import { VariantItemListParams } from "@/types/variant.types";

export function useVariantItems(params: VariantItemListParams = {}) {
  return useQuery({
    queryKey: ["variant-items", params],
    queryFn: () => variantService.listItems(params),
  });
}
