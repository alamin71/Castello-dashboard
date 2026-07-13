import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "@/services/product.service";
import { CreateProductPayload } from "@/types/product.types";
import { toast } from "@/store/toast.store";

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProductPayload) => productService.create(payload),
    onSuccess: () => {
      toast.success("Product created successfully");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
