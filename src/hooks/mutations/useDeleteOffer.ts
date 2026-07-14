import { useMutation, useQueryClient } from "@tanstack/react-query";
import { offerService } from "@/services/offer.service";
import { toast } from "@/store/toast.store";

export function useDeleteOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => offerService.delete(id),
    onSuccess: () => {
      toast.success("Offer deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["offers"] });
    },
  });
}
