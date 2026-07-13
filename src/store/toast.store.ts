import { create } from "zustand";

interface ToastItem {
  id: string;
  message: string;
  type: "success" | "error";
}

interface ToastStore {
  toasts: ToastItem[];
  addToast: (message: string, type?: "success" | "error") => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (message, type = "success") => {
    const id = Math.random().toString(36).slice(2, 9);
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 3500);
  },
  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export const toast = {
  success: (message: string) =>
    useToastStore.getState().addToast(message, "success"),
  error: (message: string) =>
    useToastStore.getState().addToast(message, "error"),
};
