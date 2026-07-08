// Matches backend response exactly

export interface AdminUser {
  _id: string;
  name: string;
  role: string;
  email: string;
  image: string;
  status: string;
  verified: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
  admin: AdminUser;
}

export interface ForgotPasswordPayload {
  email: string;
}

// POST /admin/forget-password → data
export interface ForgotPasswordResponseData {
  otp: string;       // visible in DEV
  otpToken: string;  // pass as header in subsequent steps
}

// POST /admin/resend-otp — header: resend-token = otpToken
export interface ResendOtpPayload {
  otpToken: string;
}

export interface ResendOtpResponseData {
  otp: string;
  otpToken: string; // updated token — replace the old one
}

// POST /admin/verify-reset-otp — header: otp-token = otpToken, body: { otp }
export interface VerifyResetOtpPayload {
  otp: string;
  otpToken: string;
}

export interface VerifyResetOtpResponseData {
  resetToken: string; // pass as header in reset-password
}

// POST /admin/reset-password — header: reset-token = resetToken, body: { newPassword, confirmPassword }
export interface ResetPasswordPayload {
  newPassword: string;
  confirmPassword: string;
  resetToken: string;
}
