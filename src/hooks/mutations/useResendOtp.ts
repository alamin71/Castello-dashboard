import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import { ResendOtpPayload } from "@/types/auth.types";

export function useResendOtp() {
  return useMutation({
    mutationFn: (payload: ResendOtpPayload) => authService.resendOtp(payload),
  });
}
