"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, CheckCircle } from "lucide-react";
import { useLogin } from "@/hooks/mutations/useLogin";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showToast, setShowToast] = useState(false);

  const { mutate: login, isPending, error } = useLogin();

  const errorMessage = error
    ? ((error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
      "Invalid email or password.")
    : "";

  const handleSignIn = () => {
    if (!email || !password) return;
    login(
      { email, password },
      { onSuccess: () => setShowToast(true) }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSignIn();
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4">
      {/* Success toast */}
      {showToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-emerald-500 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-2xl">
          <CheckCircle size={18} />
          Login successful!
        </div>
      )}

      <div className="bg-[#1a1a1a] rounded-2xl p-8 w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image src="/assets/logo.png" alt="Castello" width={130} height={44} className="object-contain" />
        </div>

        {/* Heading */}
        <div className="text-center mb-7">
          <h1 className="text-xl font-bold text-white mb-1">Sign In</h1>
          <p className="text-sm text-white/50">Enter your email &amp; password to sign in</p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-white">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter email address"
              className={`w-full bg-[#0f0f0f] border rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-colors ${
                error ? "border-red-500/60 focus:border-red-500" : "border-white/10 focus:border-white/30"
              }`}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-white">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter your password"
                className={`w-full bg-[#0f0f0f] border rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-white/30 outline-none transition-colors ${
                  error ? "border-red-500/60 focus:border-red-500" : "border-white/10 focus:border-white/30"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Error message */}
          {errorMessage && (
            <p className="text-sm text-red-400">{errorMessage}</p>
          )}

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-white/70">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              Remember Me
            </label>
            <Link
              href="/admin/forgot-password"
              className="text-sm font-semibold text-white hover:text-white/70 transition-colors"
            >
              Forgot Password
            </Link>
          </div>

          <button
            onClick={handleSignIn}
            disabled={isPending}
            className="w-full py-3.5 rounded-xl bg-white text-[#141414] text-sm font-semibold hover:bg-white/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isPending ? "Signing in…" : "Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}
