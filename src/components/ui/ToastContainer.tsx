"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { useToastStore } from "@/store/toast.store";

function ToastItem({
  id,
  message,
  type,
}: {
  id: string;
  message: string;
  type: "success" | "error";
  onRemove: (id: string) => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    const hide = setTimeout(() => setVisible(false), 3000);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(hide);
    };
  }, []);

  return (
    <div
      style={{
        transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(-12px) scale(0.95)",
      }}
      className={`flex items-center gap-3 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-2xl ${
        type === "success" ? "bg-emerald-500" : "bg-red-500"
      }`}
    >
      {type === "success" ? (
        <CheckCircle size={18} className="shrink-0" />
      ) : (
        <XCircle size={18} className="shrink-0" />
      )}
      {message}
    </div>
  );
}

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-9999 flex flex-col items-center gap-2 pointer-events-none">
      {toasts.map((t) => (
        <ToastItem
          key={t.id}
          id={t.id}
          message={t.message}
          type={t.type}
          onRemove={removeToast}
        />
      ))}
    </div>
  );
}
