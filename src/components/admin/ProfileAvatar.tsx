"use client";

import { User } from "lucide-react";

interface Props {
  image: string;
  name: string;
  size: "sm" | "lg";
}

export function ProfileAvatar({ image, name, size }: Props) {
  const initials = name.trim().split(/\s+/).map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const iconSize = size === "lg" ? 28 : 16;
  const textClass = size === "lg" ? "text-xl" : "text-sm";

  if (image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={image} alt={name} className="object-cover w-full h-full" />;
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
