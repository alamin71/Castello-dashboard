import { useQuery } from "@tanstack/react-query";
import { toppingService } from "@/services/topping.service";
import { ToppingItemListParams } from "@/types/topping.types";

export function useToppingItems(params: ToppingItemListParams = {}) {
  return useQuery({
    queryKey: ["topping-items", params],
    queryFn: () => toppingService.listItems(params),
  });
}
