import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import { ForgotPasswordPayload } from "@/types/auth.types";

export function useForgotPassword() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordPayload) =>
      authService.forgotPassword(payload),
    // onSuccess: caller handles — receives { otp, otpToken }
  });
}
