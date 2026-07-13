import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "@/services/product.service";
import { toast } from "@/store/toast.store";

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productService.delete(id),
    onSuccess: () => {
      toast.success("Product deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
