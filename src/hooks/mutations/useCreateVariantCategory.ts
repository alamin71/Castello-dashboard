import { useMutation, useQueryClient } from "@tanstack/react-query";
import { variantService } from "@/services/variant.service";
import { CreateVariantCategoryPayload } from "@/types/variant.types";

export function useCreateVariantCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateVariantCategoryPayload) => variantService.createCategory(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["variant-categories"] }),
  });
}
