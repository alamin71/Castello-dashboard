"use client";

import { useState } from "react";
import { Camera, Trash2, CheckCircle, X } from "lucide-react";
import { useUpdateProfile } from "@/hooks/mutations/useUpdateProfile";
import { useRemoveProfilePhoto } from "@/hooks/mutations/useRemoveProfilePhoto";
import { useAuthStore } from "@/store/auth.store";
import { authService } from "@/services/auth.service";
import { ProfileAvatar } from "@/components/admin/ProfileAvatar";

// ─── Modal shell ──────────────────────────────────────────────────────────────
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

function Btn({ children, onClick, outline, disabled }: {
  children: React.ReactNode; onClick?: () => void; outline?: boolean; disabled?: boolean;
}) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={`flex-1 py-3 rounded-full text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
        outline ? "border border-white/20 text-white hover:bg-white/5" : "bg-[#ff4d00] text-white hover:bg-[#e84400]"
      }`}>
      {children}
    </button>
  );
}

// ─── Change Photo Modal ───────────────────────────────────────────────────────
function ChangePhotoModal({ currentImage, currentName, onClose }: {
  currentImage: string; currentName: string; onClose: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const updateAdmin = useAuthStore((s) => s.updateAdmin);
  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setFile(f); setPreview(URL.createObjectURL(f)); }
  };

  const handleSave = () => {
    if (!file) return;
    updateProfile({ image: file }, {
      onSuccess: (updated) => {
        updateAdmin(updated);
        onClose();
      },
    });
  };

  return (
    <Modal title="Change Profile Photo" onClose={onClose}>
      <div className="px-6 py-6 flex flex-col items-center gap-5">
        <div className="w-24 h-24 rounded-full overflow-hidden ring-2 ring-white/10">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="preview" className="object-cover w-full h-full" />
          ) : (
            <ProfileAvatar image={currentImage} name={currentName} size="lg" />
          )}
        </div>
        <div className="w-full space-y-1.5">
          <label className="text-sm text-white">Choose a new image</label>
          <label className="flex items-center gap-3 w-full bg-[#0f0f0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white/40 cursor-pointer hover:border-white/20 transition-colors">
            <span className="text-white/60 text-xs bg-white/10 px-2 py-1 rounded">Choose File</span>
            <span className="truncate">{file ? file.name : "No file chosen"}</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </label>
        </div>
      </div>
      <div className="px-6 pb-6 border-t border-white/10 pt-4 flex gap-3">
        <Btn outline onClick={onClose}>Cancel</Btn>
        <Btn onClick={handleSave} disabled={!file || isPending}>
          {isPending ? "Saving…" : "Save Changes"}
        </Btn>
      </div>
    </Modal>
  );
}

// ─── Remove Photo Modal ───────────────────────────────────────────────────────
function RemovePhotoModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const admin = useAuthStore((s) => s.admin);
  const updateAdmin = useAuthStore((s) => s.updateAdmin);
  const { mutate: removePhoto, isPending } = useRemoveProfilePhoto();

  const handleRemove = () => {
    removePhoto(undefined, {
      onSuccess: async () => {
        try {
          const fresh = await authService.getMe();
          updateAdmin(fresh);
        } catch {
          if (admin) updateAdmin({ ...admin, image: "" });
        }
        onDone();
        onClose();
      },
    });
  };

  return (
    <Modal title="Remove Profile Photo" onClose={onClose}>
      <div className="px-6 py-6">
        <p className="text-sm text-white">Are you sure you want to remove the current profile photo?</p>
      </div>
      <div className="px-6 pb-6 border-t border-white/10 pt-4 flex gap-3">
        <Btn outline onClick={onClose}>Cancel</Btn>
        <Btn onClick={handleRemove} disabled={isPending}>
          {isPending ? "Removing…" : "Remove Photo"}
        </Btn>
      </div>
    </Modal>
  );
}

// ─── Profile Card + Modals (self-contained) ───────────────────────────────────
export default function ProfileSettings({ onToast }: { onToast: (msg: string) => void }) {
  const admin = useAuthStore((s) => s.admin);
  const [showChange, setShowChange] = useState(false);
  const [showRemove, setShowRemove] = useState(false);

  const displayName = admin?.name ?? "";
  const displayImage = admin?.image ?? "";

  return (
    <>
      <div className="bg-[#1a1a1a] border border-white/6 rounded-2xl p-6 mb-6 max-w-2xl">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-white/10 shrink-0">
            <ProfileAvatar image={displayImage} name={displayName} size="lg" />
          </div>
          <div>
            <p className="text-base font-semibold text-white mb-0.5">{displayName}</p>
            <p className="text-sm text-white/40 mb-3">{admin?.role ?? "Super Admin"}</p>
            <div className="flex flex-col gap-2">
              <button onClick={() => setShowChange(true)}
                className="flex items-center gap-2 text-sm text-[#ff4d00] hover:text-[#e84400] transition-colors">
                <Camera size={15} /> Change Profile Photo
              </button>
              <button onClick={() => setShowRemove(true)}
                className="flex items-center gap-2 text-sm text-[#ff4d00] hover:text-[#e84400] transition-colors">
                <Trash2 size={15} /> Remove Profile Photo
              </button>
            </div>
          </div>
        </div>
      </div>

      {showChange && (
        <ChangePhotoModal
          currentImage={displayImage}
          currentName={displayName}
          onClose={() => {
            setShowChange(false);
            onToast("Profile photo updated!");
          }}
        />
      )}
      {showRemove && (
        <RemovePhotoModal
          onClose={() => setShowRemove(false)}
          onDone={() => onToast("Profile photo removed!")}
        />
      )}
    </>
  );
}

// ─── Toast component (reusable) ───────────────────────────────────────────────
export function SuccessToast({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-emerald-500 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-2xl">
      <CheckCircle size={18} /> {message}
    </div>
  );
}
