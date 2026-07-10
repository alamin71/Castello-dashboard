import { useQuery } from "@tanstack/react-query";
import { variantService } from "@/services/variant.service";
import { VariantListParams } from "@/types/variant.types";

export function useVariantCategories(params: VariantListParams = {}) {
  return useQuery({
    queryKey: ["variant-categories", params],
    queryFn: () => variantService.listCategories(params),
  });
}
