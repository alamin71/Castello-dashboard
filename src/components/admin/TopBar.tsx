"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Settings, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { ProfileAvatar } from "@/components/admin/ProfileAvatar";

export default function TopBar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const admin = useAuthStore((s) => s.admin);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const handleLogout = () => {
    clearAuth();
    document.cookie = "castello_auth=; path=/; max-age=0";
    router.push("/admin/login");
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="flex items-center justify-end px-6 py-4 border-b border-white/6 bg-[#0f0f0f]">
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-9 h-9 rounded-full overflow-hidden ring-1 ring-white/10 hover:ring-white/30 transition-all cursor-pointer"
        >
          <ProfileAvatar image={admin?.image ?? ""} name={admin?.name ?? ""} size="sm" />
        </button>

        {open && (
          <div className="absolute right-0 top-11 w-48 bg-[#232323] border border-white/10 rounded-xl shadow-2xl py-1 z-50">
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white hover:bg-white/5 transition-colors"
            >
              <Settings size={15} className="text-white/50" />
              Account Settings
            </Link>
            <button onClick={handleLogout} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-[#ff4d00] hover:bg-white/5 transition-colors">
              <LogOut size={15} />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
