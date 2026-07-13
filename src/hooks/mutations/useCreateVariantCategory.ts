import { useMutation, useQueryClient } from "@tanstack/react-query";
import { variantService } from "@/services/variant.service";
import { CreateVariantCategoryPayload } from "@/types/variant.types";
import { toast } from "@/store/toast.store";

export function useCreateVariantCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateVariantCategoryPayload) => variantService.createCategory(payload),
    onSuccess: () => {
      toast.success("Variant category created successfully");
      queryClient.invalidateQueries({ queryKey: ["variant-categories"] });
    },
  });
}
