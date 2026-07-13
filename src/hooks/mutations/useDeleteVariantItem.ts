import { useMutation, useQueryClient } from "@tanstack/react-query";
import { variantService } from "@/services/variant.service";
import { toast } from "@/store/toast.store";

export function useDeleteVariantItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => variantService.deleteItem(id),
    onSuccess: () => {
      toast.success("Variant item deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["variant-items"] });
    },
  });
}
