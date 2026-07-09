"use client";

import { useState, useEffect } from "react";
import { User } from "lucide-react";

interface Props {
  image: string;
  name: string;
  size: "sm" | "lg";
}

export function ProfileAvatar({ image, name, size }: Props) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => { setImgError(false); }, [image]);
  const initials = name.trim().split(/\s+/).map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const iconSize = size === "lg" ? 28 : 16;
  const textClass = size === "lg" ? "text-xl" : "text-sm";

  if (image && !imgError) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt={name}
        className="object-cover w-full h-full"
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-[#ff4d00]/15">
      {initials ? (
        <span className={`font-semibold text-[#ff4d00] ${textClass}`}>{initials}</span>
      ) : (
        <User size={iconSize} className="text-[#ff4d00]" />
      )}
    </div>
  );
}
