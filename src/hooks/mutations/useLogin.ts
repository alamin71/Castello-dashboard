import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { LoginPayload } from "@/types/auth.types";

export function useLogin() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),

    onSuccess: ({ accessToken, refreshToken, admin }) => {
      // 1. Save to Zustand (persisted to localStorage)
      setAuth(admin, accessToken, refreshToken);

      // 2. Set cookie for Next.js middleware route protection
      document.cookie = `castello_auth=1; path=/; max-age=${60 * 60 * 24 * 7}`;

      // 3. Redirect to dashboard
      router.push("/dashboard");
    },
  });
}
