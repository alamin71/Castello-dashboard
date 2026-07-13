import { useMutation, useQueryClient } from "@tanstack/react-query";
import { variantService } from "@/services/variant.service";
import { toast } from "@/store/toast.store";

export function useDeleteVariantCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => variantService.deleteCategory(id),
    onSuccess: () => {
      toast.success("Variant category deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["variant-categories"] });
    },
  });
}
