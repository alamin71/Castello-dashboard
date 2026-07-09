import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";

export function useRemoveProfilePhoto() {
  return useMutation({
    mutationFn: () => authService.removeProfilePhoto(),
  });
}
