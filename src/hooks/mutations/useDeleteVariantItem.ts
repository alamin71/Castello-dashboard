import { useMutation, useQueryClient } from "@tanstack/react-query";
import { variantService } from "@/services/variant.service";

export function useDeleteVariantItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => variantService.deleteItem(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["variant-items"] }),
  });
}
