import { useMutation, useQueryClient } from "@tanstack/react-query";
import { variantService } from "@/services/variant.service";
import { CreateVariantItemPayload } from "@/types/variant.types";
import { toast } from "@/store/toast.store";

export function useCreateVariantItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateVariantItemPayload) => variantService.createItem(payload),
    onSuccess: () => {
      toast.success("Variant item created successfully");
      queryClient.invalidateQueries({ queryKey: ["variant-items"] });
    },
  });
}
