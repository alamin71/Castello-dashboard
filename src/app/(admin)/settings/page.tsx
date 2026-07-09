"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Pencil, Eye, EyeOff, Camera, Trash2, CheckCircle, X } from "lucide-react";
import { useChangePassword } from "@/hooks/mutations/useChangePassword";

type SettingsTab = "basic" | "password";
type EmailStep = "enter" | "verify" | "otp" | "success";

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

// ─── Change Profile Photo modal ───────────────────────────────────────────────
function ChangeProfilePhotoModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="Change Profile Photo" onClose={onClose}>
      <div className="px-6 py-6 flex flex-col items-center gap-5">
        <div className="w-24 h-24 rounded-full overflow-hidden ring-2 ring-white/10">
          <Image src="/assets/Team.png" alt="Profile" width={96} height={96} className="object-cover w-full h-full" />
        </div>
        <div className="w-full space-y-1.5">
          <label className="text-sm text-white">Choose a new image</label>
          <label className="flex items-center gap-3 w-full bg-[#0f0f0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white/40 cursor-pointer hover:border-white/20 transition-colors">
            <span className="text-white/60 text-xs bg-white/10 px-2 py-1 rounded">Choose File</span>
            <span>No file chosen</span>
            <input type="file" accept="image/*" className="hidden" />
          </label>
        </div>
      </div>
      <div className="px-6 pb-6 border-t border-white/10 pt-4">
        <div className="flex gap-3">
          <ActionBtn variant="outline" onClick={onClose}>Cancel</ActionBtn>
          <ActionBtn onClick={onClose}>Save Changes</ActionBtn>
        </div>
      </div>
    </Modal>
  );
}

// ─── Remove Profile Photo modal ───────────────────────────────────────────────
function RemoveProfilePhotoModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="Remove Profile Photo" onClose={onClose}>
      <div className="px-6 py-6">
        <p className="text-sm text-white">Are you sure you want to remove the current profile photo?</p>
      </div>
      <div className="px-6 pb-6 border-t border-white/10 pt-4">
        <div className="flex gap-3">
          <ActionBtn variant="outline" onClick={onClose}>Cancel</ActionBtn>
          <ActionBtn onClick={onClose}>Remove Photo</ActionBtn>
        </div>
      </div>
    </Modal>
  );
}

// ─── Change Name modal ─────────────────────────────────────────────────────────
function ChangeNameModal({ currentName, onClose, onSave }: { currentName: string; onClose: () => void; onSave: (name: string) => void }) {
  const [name, setName] = useState(currentName);
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
          <ActionBtn onClick={() => { onSave(name); onClose(); }}>Save Changes</ActionBtn>
        </div>
      </div>
    </Modal>
  );
}

// ─── Change Email multi-step modal ────────────────────────────────────────────
function ChangeEmailModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<EmailStep>("enter");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
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

  if (step === "success") {
    return (
      <Modal title="Change Email Address" onClose={onClose}>
        <div className="px-6 py-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center mb-4">
            <CheckCircle size={32} className="text-white" />
          </div>
          <p className="text-base font-semibold text-white mb-1">Successfully Verified & Updated</p>
          <p className="text-sm text-white/50">Your new email address is successfully verified<br />& updated</p>
        </div>
        <div className="px-6 pb-6 border-t border-white/10 pt-4">
          <button onClick={onClose} className="w-full py-3 rounded-full bg-[#ff4d00] text-white text-sm font-medium hover:bg-[#e84400] transition-colors">
            Sign In
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
            <p className="text-sm text-white/50 mb-1">Enter the verification code we sent to your email</p>
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
                  digit ? "bg-[#0f0f0f] border-white/30 text-white" : "bg-[#ff4d00]/10 border-[#ff4d00]/30 text-white"
                } focus:border-white/50`}
              />
            ))}
          </div>
          <p className="text-center text-sm text-white/40">
            Didn&apos;t get OTP?{" "}
            <button className="text-[#ff4d00] font-medium hover:underline">Resend</button>
          </p>
        </div>
        <div className="px-6 pb-6 border-t border-white/10 pt-4">
          <div className="flex gap-3">
            <ActionBtn variant="outline" onClick={onClose}>Cancel</ActionBtn>
            <ActionBtn onClick={() => setStep("success")}>Verify OTP</ActionBtn>
          </div>
        </div>
      </Modal>
    );
  }

  if (step === "verify") {
    return (
      <Modal title="Change Email Address" onClose={onClose}>
        <div className="px-6 py-5 space-y-4">
          <div>
            <p className="text-base font-semibold text-white mb-0.5">Verify Your Email</p>
            <p className="text-sm text-white/50">Enter your email address to get an OTP code</p>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm text-white">New Email Address</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter new email address"
              className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-white/30"
            />
          </div>
        </div>
        <div className="px-6 pb-6 border-t border-white/10 pt-4">
          <div className="flex gap-3">
            <ActionBtn variant="outline" onClick={onClose}>Cancel</ActionBtn>
            <ActionBtn onClick={() => setStep("otp")}>Get OTP</ActionBtn>
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
            className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-white/30"
          />
        </div>
      </div>
      <div className="px-6 pb-6 border-t border-white/10 pt-4">
        <div className="flex gap-3">
          <ActionBtn variant="outline" onClick={onClose}>Cancel</ActionBtn>
          <ActionBtn onClick={() => setStep("verify")}>Continue</ActionBtn>
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
  const [name, setName] = useState("Christopher Nesscrance");
  const email = "superadmin@castello.com";

  const [showChangeName, setShowChangeName] = useState(false);
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [showChangePhoto, setShowChangePhoto] = useState(false);
  const [showRemovePhoto, setShowRemovePhoto] = useState(false);

  return (
    <div className="p-6 min-h-screen">
      <h1 className="text-2xl font-semibold text-white mb-6">Account Settings</h1>

      {/* Profile card */}
      <div className="bg-[#1a1a1a] border border-white/6 rounded-2xl p-6 mb-6 max-w-2xl">
        <div className="flex items-start gap-5">
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-white/10">
              <Image src="/assets/Team.png" alt="Profile" width={80} height={80} className="object-cover w-full h-full" />
            </div>
          </div>
          <div>
            <p className="text-base font-semibold text-white mb-0.5">{name}</p>
            <p className="text-sm text-white/40 mb-3">Super Admin</p>
            <div className="flex flex-col gap-2">
              <button onClick={() => setShowChangePhoto(true)} className="flex items-center gap-2 text-sm text-[#ff4d00] hover:text-[#e84400] transition-colors">
                <Camera size={15} /> Change Profile Photo
              </button>
              <button onClick={() => setShowRemovePhoto(true)} className="flex items-center gap-2 text-sm text-[#ff4d00] hover:text-[#e84400] transition-colors">
                <Trash2 size={15} /> Remove Profile Photo
              </button>
            </div>
          </div>
        </div>
      </div>

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
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white">Full Name</label>
              <div className="flex items-center justify-between bg-[#0f0f0f] border border-white/10 rounded-xl px-4 py-3">
                <span className="text-sm text-white/60">{name}</span>
                <button
                  onClick={() => setShowChangeName(true)}
                  className="text-white/40 hover:text-white transition-colors"
                >
                  <Pencil size={15} />
                </button>
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white">Email Address</label>
              <div className="flex items-center justify-between bg-[#0f0f0f] border border-white/10 rounded-xl px-4 py-3">
                <span className="text-sm text-white/60">{email}</span>
                <button
                  onClick={() => setShowChangeEmail(true)}
                  className="text-white/40 hover:text-white transition-colors"
                >
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
          currentName={name}
          onClose={() => setShowChangeName(false)}
          onSave={(n) => setName(n)}
        />
      )}
      {showChangeEmail && (
        <ChangeEmailModal onClose={() => setShowChangeEmail(false)} />
      )}
      {showChangePhoto && (
        <ChangeProfilePhotoModal onClose={() => setShowChangePhoto(false)} />
      )}
      {showRemovePhoto && (
        <RemoveProfilePhotoModal onClose={() => setShowRemovePhoto(false)} />
      )}
    </div>
  );
}
