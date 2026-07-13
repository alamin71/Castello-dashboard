import { useMutation, useQueryClient } from "@tanstack/react-query";
import { variantService } from "@/services/variant.service";
import { UpdateVariantCategoryPayload } from "@/types/variant.types";
import { toast } from "@/store/toast.store";

export function useUpdateVariantCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateVariantCategoryPayload }) =>
      variantService.updateCategory(id, payload),
    onSuccess: () => {
      toast.success("Variant category updated successfully");
      queryClient.invalidateQueries({ queryKey: ["variant-categories"] });
    },
  });
}
