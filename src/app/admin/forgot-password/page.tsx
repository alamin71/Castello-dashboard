"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, X, Eye, EyeOff } from "lucide-react";

type Step = "forgot" | "otp" | "set-password";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("forgot");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

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

        {/* ── Step: Forgot Password ── */}
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
                  placeholder="Enter email address"
                  className="w-full border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-white/30 transition-colors"
                />
              </div>
              <button
                onClick={() => setStep("otp")}
                className="w-full py-3.5 rounded-xl bg-white text-[#141414] text-sm font-semibold hover:bg-white/90 transition-colors"
              >
                Send OTP
              </button>
            </div>
          </>
        )}

        {/* ── Step: OTP Verification ── */}
        {step === "otp" && (
          <>
            <div className="text-center mb-7">
              <h1 className="text-xl font-bold text-white mb-1">OTP Verification</h1>
              <p className="text-sm text-white/50 mb-1">Enter the OTP code we sent to your email</p>
              <p className="text-sm font-semibold text-white">{email || "castello.admin@gmail.com"}</p>
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
                    className="w-11 h-11 text-center text-base font-medium rounded-xl border border-white/15 text-white outline-none focus:border-white/50 transition-colors"
                  />
                ))}
              </div>
              <p className="text-center text-sm text-white/40">
                Didn&apos;t get OTP?{" "}
                <button className="text-white font-semibold hover:underline">Resend</button>
              </p>
              <button
                onClick={() => setStep("set-password")}
                className="w-full py-3.5 rounded-xl bg-white text-[#141414] text-sm font-semibold hover:bg-white/90 transition-colors"
              >
                Verify OTP
              </button>
            </div>
          </>
        )}

        {/* ── Step: Set New Password ── */}
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
                    placeholder="Enter new password"
                    className="w-full border border-white/10 rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-white/30 outline-none focus:border-white/30 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                  >
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-white">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Re-type new password"
                    className="w-full border border-white/10 rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-white/30 outline-none focus:border-white/30 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button
                onClick={() => router.push("/admin/login")}
                className="w-full py-3.5 rounded-xl bg-white text-[#141414] text-sm font-semibold hover:bg-white/90 transition-colors"
              >
                Set New Password
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
