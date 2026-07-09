import apiClient from "@/lib/axios";
import API from "@/config/api.endpoints";
import {
  LoginPayload,
  LoginResponseData,
  ForgotPasswordPayload,
  ForgotPasswordResponseData,
  ResendOtpPayload,
  ResendOtpResponseData,
  VerifyResetOtpPayload,
  VerifyResetOtpResponseData,
  ResetPasswordPayload,
  ChangePasswordPayload,
  UpdateProfilePayload,
  AdminUser,
} from "@/types/auth.types";
import { ApiResponse } from "@/types/api.types";

export const authService = {
  login: async (payload: LoginPayload): Promise<LoginResponseData> => {
    const res = await apiClient.post<ApiResponse<LoginResponseData>>(
      API.auth.login,
      payload
    );
    return res.data.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post(API.auth.logout);
  },

  getMe: async (): Promise<AdminUser> => {
    const res = await apiClient.get<ApiResponse<AdminUser>>(API.auth.me);
    return res.data.data;
  },

  forgotPassword: async (payload: ForgotPasswordPayload): Promise<ForgotPasswordResponseData> => {
    const res = await apiClient.post<ApiResponse<ForgotPasswordResponseData>>(
      API.auth.forgotPassword,
      payload
    );
    return res.data.data;
  },

  // header: resend-token = otpToken
  resendOtp: async ({ otpToken }: ResendOtpPayload): Promise<ResendOtpResponseData> => {
    const res = await apiClient.post<ApiResponse<ResendOtpResponseData>>(
      API.auth.resendOtp,
      {},
      { headers: { "resend-token": otpToken } }
    );
    return res.data.data;
  },

  // header: otp-token = otpToken, body: { otp }
  verifyResetOtp: async ({ otp, otpToken }: VerifyResetOtpPayload): Promise<VerifyResetOtpResponseData> => {
    const res = await apiClient.post<ApiResponse<VerifyResetOtpResponseData>>(
      API.auth.verifyResetOtp,
      { otp },
      { headers: { "otp-token": otpToken } }
    );
    return res.data.data;
  },

  // header: reset-token = resetToken, body: { newPassword, confirmPassword }
  resetPassword: async ({ resetToken, newPassword, confirmPassword }: ResetPasswordPayload): Promise<void> => {
    await apiClient.post(
      API.auth.resetPassword,
      { newPassword, confirmPassword },
      { headers: { "reset-token": resetToken } }
    );
  },

  // Authorization Bearer token auto-attached by Axios interceptor
  changePassword: async (payload: ChangePasswordPayload): Promise<void> => {
    await apiClient.patch(API.auth.changePassword, payload);
  },

  // PATCH /admin/profile/update — multipart/form-data
  updateProfile: async (payload: UpdateProfilePayload): Promise<AdminUser> => {
    const formData = new FormData();
    if (payload.name) formData.append("name", payload.name);
    if (payload.image) formData.append("image", payload.image);
    const res = await apiClient.patch<ApiResponse<AdminUser>>(
      API.auth.updateProfile,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data.data;
  },

  // DELETE /admin/profile/photo
  removeProfilePhoto: async (): Promise<void> => {
    await apiClient.delete(API.auth.removeProfilePhoto);
  },
};
