import { useQuery } from "@tanstack/react-query";
import { toppingService } from "@/services/topping.service";
import { ToppingListParams } from "@/types/topping.types";

export function useToppingCategories(params: ToppingListParams = {}) {
  return useQuery({
    queryKey: ["topping-categories", params],
    queryFn: () => toppingService.listCategories(params),
  });
}
