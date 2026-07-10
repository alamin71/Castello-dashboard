import { useMutation, useQueryClient } from "@tanstack/react-query";
import { variantService } from "@/services/variant.service";
import { CreateVariantItemPayload } from "@/types/variant.types";

export function useCreateVariantItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateVariantItemPayload) => variantService.createItem(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["variant-items"] }),
  });
}
