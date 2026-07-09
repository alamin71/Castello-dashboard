import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import { ChangeEmailVerifyOtpPayload } from "@/types/auth.types";

export function useVerifyEmailChangeOtp() {
  return useMutation({
    mutationFn: (payload: ChangeEmailVerifyOtpPayload) =>
      authService.verifyEmailChangeOtp(payload),
  });
}
