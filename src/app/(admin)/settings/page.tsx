"use client";

import { useState, useRef } from "react";
import { Pencil, Eye, EyeOff, CheckCircle, X } from "lucide-react";
import { useChangePassword } from "@/hooks/mutations/useChangePassword";
import { useUpdateProfile } from "@/hooks/mutations/useUpdateProfile";
import { useRequestEmailChange } from "@/hooks/mutations/useRequestEmailChange";
import { useVerifyEmailChangeOtp } from "@/hooks/mutations/useVerifyEmailChangeOtp";
import { useAuthStore } from "@/store/auth.store";
import ProfileSettings, { SuccessToast } from "./ProfileSettings";

type SettingsTab = "basic" | "password";
type EmailStep = "enter" | "otp" | "success";

// ─── Shared modal shell ────────────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-[#1a1a1a] rounded-2xl w-full max-w-120 mx-4">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="text-white hover:text-red-400 transition-colors">
            <X size={24} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ActionBtn({ children, onClick, variant = "primary" }: { children: React.ReactNode; onClick?: () => void; variant?: "primary" | "outline" }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-3 rounded-full text-sm font-medium transition-colors ${
        variant === "primary"
          ? "bg-[#ff4d00] text-white hover:bg-[#e84400]"
          : "border border-white/20 text-white hover:bg-white/5"
      }`}
    >
      {children}
    </button>
  );
}

// ─── Change Name modal ─────────────────────────────────────────────────────────
function ChangeNameModal({ currentName, onClose, onSave }: { currentName: string; onClose: () => void; onSave: (name: string) => void }) {
  const [name, setName] = useState(currentName);
  const { mutate: updateProfile, isPending } = useUpdateProfile();
  const updateAdmin = useAuthStore((s) => s.updateAdmin);

  const handleSave = () => {
    if (!name.trim()) return;
    updateProfile({ name: name.trim() }, {
      onSuccess: (updated) => {
        updateAdmin(updated);
        onSave(updated.name);
        onClose();
      },
    });
  };

  return (
    <Modal title="Change Name" onClose={onClose}>
      <div className="px-6 py-5 space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm text-white">Full Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-white/30"
          />
        </div>
      </div>
      <div className="px-6 pb-6 border-t border-white/10 pt-4">
        <div className="flex gap-3">
          <ActionBtn variant="outline" onClick={onClose}>Cancel</ActionBtn>
          <ActionBtn onClick={handleSave}>{isPending ? "Saving…" : "Save Changes"}</ActionBtn>
        </div>
      </div>
    </Modal>
  );
}

// ─── Change Email multi-step modal ────────────────────────────────────────────
function ChangeEmailModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [step, setStep] = useState<EmailStep>("enter");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const updateAdmin = useAuthStore((s) => s.updateAdmin);
  const admin = useAuthStore((s) => s.admin);

  const { mutate: requestChange, isPending: isRequesting, error: requestError } = useRequestEmailChange();
  const { mutate: verifyOtp, isPending: isVerifying, error: verifyError } = useVerifyEmailChangeOtp();

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

  const handleRequestOtp = () => {
    if (!email.trim()) return;
    requestChange({ newEmail: email.trim() }, {
      onSuccess: () => setStep("otp"),
    });
  };

  const handleVerifyOtp = () => {
    const otpStr = otp.join("");
    if (otpStr.length < 6) return;
    verifyOtp({ otp: otpStr }, {
      onSuccess: () => {
        if (admin) updateAdmin({ ...admin, email: email.trim() });
        setStep("success");
      },
    });
  };

  const requestErrMsg = requestError
    ? ((requestError as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to send OTP.")
    : "";
  const verifyErrMsg = verifyError
    ? ((verifyError as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Invalid OTP.")
    : "";

  if (step === "success") {
    return (
      <Modal title="Change Email Address" onClose={onClose}>
        <div className="px-6 py-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center mb-4">
            <CheckCircle size={32} className="text-white" />
          </div>
          <p className="text-base font-semibold text-white mb-1">Email Updated Successfully</p>
          <p className="text-sm text-white/50">Your email address has been updated to<br /><span className="text-[#ff4d00]">{email}</span></p>
        </div>
        <div className="px-6 pb-6 border-t border-white/10 pt-4">
          <button onClick={() => { onSuccess(); onClose(); }} className="w-full py-3 rounded-full bg-[#ff4d00] text-white text-sm font-medium hover:bg-[#e84400] transition-colors">
            Done
          </button>
        </div>
      </Modal>
    );
  }

  if (step === "otp") {
    return (
      <Modal title="Change Email Address" onClose={onClose}>
        <div className="px-6 py-5 space-y-4">
          <div>
            <p className="text-base font-semibold text-white mb-0.5">OTP Verification</p>
            <p className="text-sm text-white/50 mb-1">Enter the verification code sent to</p>
            <p className="text-sm text-[#ff4d00]">{email}</p>
          </div>
          <div className="flex gap-3 justify-center mt-2">
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
                className={`w-11 h-11 text-center text-base font-medium rounded-xl border outline-none transition-colors ${
                  digit ? "border-white/30 text-white" : "bg-[#ff4d00]/10 border-[#ff4d00]/30 text-white"
                } focus:border-white/50`}
              />
            ))}
          </div>
          {verifyErrMsg && <p className="text-sm text-red-400 text-center">{verifyErrMsg}</p>}
          <p className="text-center text-sm text-white/40">
            Didn&apos;t get OTP?{" "}
            <button onClick={() => handleRequestOtp()} className="text-[#ff4d00] font-medium hover:underline">Resend</button>
          </p>
        </div>
        <div className="px-6 pb-6 border-t border-white/10 pt-4">
          <div className="flex gap-3">
            <ActionBtn variant="outline" onClick={onClose}>Cancel</ActionBtn>
            <ActionBtn onClick={handleVerifyOtp}>{isVerifying ? "Verifying…" : "Verify OTP"}</ActionBtn>
          </div>
        </div>
      </Modal>
    );
  }

  // step === "enter"
  return (
    <Modal title="Change Email Address" onClose={onClose}>
      <div className="px-6 py-5 space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm text-white">New Email Address</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter new email address"
            className="w-full border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-white/30"
          />
          {requestErrMsg && <p className="text-sm text-red-400">{requestErrMsg}</p>}
        </div>
      </div>
      <div className="px-6 pb-6 border-t border-white/10 pt-4">
        <div className="flex gap-3">
          <ActionBtn variant="outline" onClick={onClose}>Cancel</ActionBtn>
          <ActionBtn onClick={handleRequestOtp}>{isRequesting ? "Sending OTP…" : "Get OTP"}</ActionBtn>
        </div>
      </div>
    </Modal>
  );
}

// ─── Password field with eye toggle ───────────────────────────────────────────
function PasswordField({
  label,
  placeholder,
  value,
  onChange,
  hasError,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  hasError?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-white">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full bg-[#0f0f0f] border rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-white/30 outline-none transition-colors ${
            hasError ? "border-red-500/60" : "border-white/10 focus:border-white/30"
          }`}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

// ─── Change Password tab ───────────────────────────────────────────────────────
function ChangePasswordTab() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showToast, setShowToast] = useState(false);

  const { mutate: changePassword, isPending, error } = useChangePassword();

  const errorMsg = error
    ? ((error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to change password.")
    : "";

  const handleSubmit = () => {
    if (!currentPassword || !newPassword || !confirmPassword) return;
    changePassword(
      { currentPassword, newPassword, confirmPassword },
      {
        onSuccess: () => {
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
          setShowToast(true);
          setTimeout(() => setShowToast(false), 3000);
        },
      }
    );
  };

  return (
    <>
      {showToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-emerald-500 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-2xl">
          <CheckCircle size={18} />
          Password changed successfully!
        </div>
      )}
      <div className="space-y-5">
        <PasswordField
          label="Current Password"
          placeholder="Enter current password"
          value={currentPassword}
          onChange={setCurrentPassword}
          hasError={!!errorMsg}
        />
        <PasswordField
          label="New Password"
          placeholder="Enter new password"
          value={newPassword}
          onChange={setNewPassword}
        />
        <PasswordField
          label="Confirm New Password"
          placeholder="Re-type new password"
          value={confirmPassword}
          onChange={setConfirmPassword}
        />
        {errorMsg && <p className="text-sm text-red-400">{errorMsg}</p>}
        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="w-full py-3 rounded-full bg-[#ff4d00] text-white text-sm font-medium hover:bg-[#e84400] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPending ? "Saving…" : "Set New Password"}
        </button>
      </div>
    </>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [tab, setTab] = useState<SettingsTab>("basic");
  const [showChangeName, setShowChangeName] = useState(false);
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const admin = useAuthStore((s) => s.admin);
  const displayName = admin?.name ?? "";
  const displayEmail = admin?.email ?? "";

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  return (
    <div className="p-6 min-h-screen">
      <SuccessToast message={toastMsg} />
      <h1 className="text-2xl font-semibold text-white mb-6">Account Settings</h1>

      {/* Profile card — photo upload/remove handled inside ProfileSettings */}
      <ProfileSettings onToast={triggerToast} />

      {/* Tabs */}
      <div className="max-w-2xl">
        <div className="flex border-b border-white/10 mb-6">
          {(["basic", "password"] as SettingsTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-1 pb-3 mr-6 text-sm font-medium border-b-2 transition-colors ${
                tab === t ? "border-[#ff4d00] text-[#ff4d00]" : "border-transparent text-white hover:text-white/70"
              }`}
            >
              {t === "basic" ? "Basic Information" : "Change Password"}
            </button>
          ))}
        </div>

        {/* Basic Information */}
        {tab === "basic" && (
          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white">Full Name</label>
              <div className="flex items-center justify-between bg-[#0f0f0f] border border-white/10 rounded-xl px-4 py-3">
                <span className="text-sm text-white/60">{displayName}</span>
                <button onClick={() => setShowChangeName(true)} className="text-white/40 hover:text-white transition-colors">
                  <Pencil size={15} />
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white">Email Address</label>
              <div className="flex items-center justify-between bg-[#0f0f0f] border border-white/10 rounded-xl px-4 py-3">
                <span className="text-sm text-white/60">{displayEmail}</span>
                <button onClick={() => setShowChangeEmail(true)} className="text-white/40 hover:text-white transition-colors">
                  <Pencil size={15} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Change Password */}
        {tab === "password" && <ChangePasswordTab />}
      </div>

      {/* Modals */}
      {showChangeName && (
        <ChangeNameModal
          currentName={displayName}
          onClose={() => setShowChangeName(false)}
          onSave={() => triggerToast("Name updated successfully!")}
        />
      )}
      {showChangeEmail && (
        <ChangeEmailModal
          onClose={() => setShowChangeEmail(false)}
          onSuccess={() => triggerToast("Email updated successfully!")}
        />
      )}
    </div>
  );
}
