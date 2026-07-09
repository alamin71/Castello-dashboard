import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import { UpdateProfilePayload } from "@/types/auth.types";

export function useUpdateProfile() {
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => authService.updateProfile(payload),
  });
}
