import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "@/services/product.service";
import { UpdateProductPayload } from "@/types/product.types";
import { toast } from "@/store/toast.store";

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateProductPayload }) =>
      productService.update(id, payload),
    onSuccess: () => {
      toast.success("Product updated successfully");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
