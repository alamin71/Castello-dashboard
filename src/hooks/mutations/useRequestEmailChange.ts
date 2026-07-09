import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import { ChangeEmailRequestPayload } from "@/types/auth.types";

export function useRequestEmailChange() {
  return useMutation({
    mutationFn: (payload: ChangeEmailRequestPayload) =>
      authService.requestEmailChange(payload),
  });
}
