"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, X, Eye, EyeOff } from "lucide-react";
import { useForgotPassword } from "@/hooks/mutations/useForgotPassword";
import { useResendOtp } from "@/hooks/mutations/useResendOtp";
import { useVerifyResetOtp } from "@/hooks/mutations/useVerifyResetOtp";
import { useResetPassword } from "@/hooks/mutations/useResetPassword";

type Step = "forgot" | "otp" | "set-password";

function extractErrorMsg(error: unknown, fallback: string): string {
  if (!error) return "";
  return (
    (error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback
  );
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("forgot");
  const [email, setEmail] = useState("");
  const [otpToken, setOtpToken] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { mutate: sendOtp, isPending: sendingOtp, error: sendOtpErr } = useForgotPassword();
  const { mutate: resendOtp, isPending: resending } = useResendOtp();
  const { mutate: verifyOtp, isPending: verifying, error: verifyErr } = useVerifyResetOtp();
  const { mutate: resetPwd, isPending: resetting, error: resetErr } = useResetPassword();

  const handleSendOtp = () => {
    if (!email) return;
    sendOtp(
      { email },
      {
        onSuccess: (data) => {
          setOtpToken(data.otpToken);
          setStep("otp");
        },
      }
    );
  };

  const handleResend = () => {
    resendOtp(
      { otpToken },
      {
        onSuccess: (data) => {
          setOtpToken(data.otpToken);
          setOtp(["", "", "", "", "", ""]);
          otpRefs.current[0]?.focus();
        },
      }
    );
  };

  const handleVerifyOtp = () => {
    const code = otp.join("");
    if (code.length < 6) return;
    verifyOtp(
      { otp: code, otpToken },
      {
        onSuccess: (data) => {
          setResetToken(data.resetToken);
          setStep("set-password");
        },
      }
    );
  };

  const handleResetPassword = () => {
    if (!newPassword || !confirmPassword) return;
    resetPwd(
      { newPassword, confirmPassword, resetToken },
      {
        onSuccess: () => {
          setSuccessMsg("Password reset successfully!");
          setTimeout(() => router.push("/admin/login"), 1500);
        },
      }
    );
  };

  const handleOtpChange = (idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) otpRefs.current[idx - 1]?.focus();
  };

  const handleBack = () => {
    if (step === "forgot") router.push("/admin/login");
    else if (step === "otp") setStep("forgot");
    else setStep("otp");
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4">
      <div className="bg-[#1a1a1a] rounded-2xl p-8 w-full max-w-md">

        {/* Back + Close */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <button
            onClick={() => router.push("/admin/login")}
            className="text-white/40 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image src="/assets/logo.png" alt="Castello" width={130} height={44} className="object-contain" />
        </div>

        {/* ── Step 1: Send OTP ── */}
        {step === "forgot" && (
          <>
            <div className="text-center mb-7">
              <h1 className="text-xl font-bold text-white mb-1">Forgot Password?</h1>
              <p className="text-sm text-white/50">Enter your email address to get an OTP code</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-white">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                  placeholder="Enter email address"
                  className={`w-full bg-[#0f0f0f] border rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-colors ${
                    sendOtpErr ? "border-red-500/60" : "border-white/10 focus:border-white/30"
                  }`}
                />
              </div>
              {sendOtpErr && (
                <p className="text-sm text-red-400">{extractErrorMsg(sendOtpErr, "Failed to send OTP.")}</p>
              )}
              <button
                onClick={handleSendOtp}
                disabled={sendingOtp}
                className="w-full py-3.5 rounded-xl bg-white text-[#141414] text-sm font-semibold hover:bg-white/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {sendingOtp ? "Sending OTP…" : "Send OTP"}
              </button>
            </div>
          </>
        )}

        {/* ── Step 2: OTP Verification ── */}
        {step === "otp" && (
          <>
            <div className="text-center mb-7">
              <h1 className="text-xl font-bold text-white mb-1">OTP Verification</h1>
              <p className="text-sm text-white/50 mb-1">Enter the OTP code we sent to your email</p>
              <p className="text-sm font-semibold text-white">{email}</p>
            </div>
            <div className="space-y-5">
              <div className="flex gap-3 justify-center">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { otpRefs.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-11 h-11 text-center text-base font-medium rounded-xl border border-white/15 bg-[#0f0f0f] text-white outline-none focus:border-white/50 transition-colors"
                  />
                ))}
              </div>
              {verifyErr && (
                <p className="text-center text-sm text-red-400">
                  {extractErrorMsg(verifyErr, "Invalid OTP. Please try again.")}
                </p>
              )}
              <p className="text-center text-sm text-white/40">
                Didn&apos;t get OTP?{" "}
                <button
                  onClick={handleResend}
                  disabled={resending}
                  className="text-white font-semibold hover:underline disabled:opacity-50"
                >
                  {resending ? "Resending…" : "Resend"}
                </button>
              </p>
              <button
                onClick={handleVerifyOtp}
                disabled={verifying || otp.join("").length < 6}
                className="w-full py-3.5 rounded-xl bg-white text-[#141414] text-sm font-semibold hover:bg-white/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {verifying ? "Verifying…" : "Verify OTP"}
              </button>
            </div>
          </>
        )}

        {/* ── Step 3: Set New Password ── */}
        {step === "set-password" && (
          <>
            <div className="text-center mb-7">
              <h1 className="text-xl font-bold text-white mb-1">Set New Password</h1>
              <p className="text-sm text-white/50">Set new password to secure your account</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-white">New Password</label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-white/30 outline-none focus:border-white/30 transition-colors"
                  />
                  <button type="button" onClick={() => setShowNew((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors">
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-white">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type new password"
                    className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-white/30 outline-none focus:border-white/30 transition-colors"
                  />
                  <button type="button" onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors">
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              {resetErr && (
                <p className="text-sm text-red-400">
                  {extractErrorMsg(resetErr, "Failed to reset password.")}
                </p>
              )}
              {successMsg && (
                <p className="text-sm text-emerald-400 text-center">{successMsg}</p>
              )}
              <button
                onClick={handleResetPassword}
                disabled={resetting}
                className="w-full py-3.5 rounded-xl bg-white text-[#141414] text-sm font-semibold hover:bg-white/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {resetting ? "Saving…" : "Set New Password"}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
