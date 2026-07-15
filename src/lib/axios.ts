import axios from "axios";
import { useAuthStore } from "@/store/auth.store";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// Attach accessToken to every request
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  // For FormData, remove the default JSON Content-Type so the browser
  // can set the correct multipart/form-data boundary automatically
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

// Handle 401 globally → clear auth and redirect to login
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth();
      document.cookie = "castello_auth=; path=/; max-age=0";
      window.location.href = "/admin/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;
