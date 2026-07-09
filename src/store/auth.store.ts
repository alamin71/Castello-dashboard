import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AdminUser } from "@/types/auth.types";

interface AuthState {
  admin: AdminUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;

  setAuth: (admin: AdminUser, accessToken: string, refreshToken: string) => void;
  updateAdmin: (admin: AdminUser) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      admin: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (admin, accessToken, refreshToken) =>
        set({ admin, accessToken, refreshToken, isAuthenticated: true }),

      updateAdmin: (admin) => set({ admin }),

      clearAuth: () =>
        set({ admin: null, accessToken: null, refreshToken: null, isAuthenticated: false }),
    }),
    { name: "castello-auth" }
  )
);
