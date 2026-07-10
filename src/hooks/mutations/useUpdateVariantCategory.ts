import { useMutation, useQueryClient } from "@tanstack/react-query";
import { variantService } from "@/services/variant.service";
import { UpdateVariantCategoryPayload } from "@/types/variant.types";

export function useUpdateVariantCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateVariantCategoryPayload }) =>
      variantService.updateCategory(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["variant-categories"] }),
  });
}
