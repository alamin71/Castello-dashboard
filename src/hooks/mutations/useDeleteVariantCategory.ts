import { useMutation, useQueryClient } from "@tanstack/react-query";
import { variantService } from "@/services/variant.service";

export function useDeleteVariantCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => variantService.deleteCategory(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["variant-categories"] }),
  });
}
