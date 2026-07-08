import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import { ResetPasswordPayload } from "@/types/auth.types";

export function useResetPassword() {
  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) => authService.resetPassword(payload),
  });
}
