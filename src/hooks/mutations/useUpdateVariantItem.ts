import { useMutation, useQueryClient } from "@tanstack/react-query";
import { variantService } from "@/services/variant.service";
import { UpdateVariantItemPayload } from "@/types/variant.types";
import { toast } from "@/store/toast.store";

export function useUpdateVariantItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateVariantItemPayload }) =>
      variantService.updateItem(id, payload),
    onSuccess: () => {
      toast.success("Variant item updated successfully");
      queryClient.invalidateQueries({ queryKey: ["variant-items"] });
    },
  });
}
