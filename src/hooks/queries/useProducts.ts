import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services/product.service";
import { ProductListParams } from "@/types/product.types";

export function useProducts(params: ProductListParams = {}) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => productService.list(params),
  });
}
