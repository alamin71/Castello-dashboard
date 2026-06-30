"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  ClipboardList,
  BarChart2,
  BookOpen,
  Tag,
  Users,
  Building2,
  Wrench,
  FileText,
  Settings,
  LogOut,
  ChevronDown,
  ChevronUp,
  Circle,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Orders", href: "/orders", icon: ClipboardList },
  { label: "Reports", href: "/reports", icon: BarChart2 },
  {
    label: "Menu",
    icon: BookOpen,
    children: [
      { label: "Products", href: "/menu/products" },
      { label: "Category", href: "/menu/category" },
      { label: "Variants", href: "/menu/variants" },
      { label: "Toppings", href: "/menu/toppings" },
    ],
  },
  {
    label: "Promotions",
    icon: Tag,
    children: [
      { label: "Special Offer", href: "/promotions/special-offer" },
      { label: "Category", href: "/promotions/category" },
      { label: "Variants", href: "/promotions/variants" },
    ],
  },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Branches", href: "/branches", icon: Building2 },
  { label: "Operations", href: "/operations", icon: Wrench },
  { label: "Pages", href: "/pages", icon: FileText },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isMenuActive = navItems
    .find((i) => i.label === "Menu")
    ?.children?.some((c) => pathname.startsWith(c.href)) ?? false;
  const isPromoActive = navItems
    .find((i) => i.label === "Promotions")
    ?.children?.some((c) => pathname.startsWith(c.href)) ?? false;

  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    Menu: isMenuActive,
    Promotions: isPromoActive,
  });

  const toggle = (label: string) =>
    setExpanded((prev) => ({ ...prev, [label]: !prev[label] }));

  return (
    <aside className="flex flex-col h-full w-52.5 shrink-0 bg-[#141414] border-r border-white/6">
      {/* Logo */}
      <div className="px-5 py-5">
        <Link href="/dashboard">
          <Image
            src="/assets/logo.png"
            alt="Castello"
            width={110}
            height={36}
            className="object-contain"
          />
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
        {navItems.map((item) => {
          if (item.children) {
            const isOpen = expanded[item.label];
            const anyChildActive = item.children.some((c) =>
              pathname.startsWith(c.href)
            );
            const Icon = item.icon;
            return (
              <div key={item.label}>
                <button
                  onClick={() => toggle(item.label)}
                  className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    anyChildActive
                      ? "bg-white/10 text-white font-medium"
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon size={16} />
                    {item.label}
                  </span>
                  {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {isOpen && (
                  <div className="mt-0.5 ml-3 pl-4 space-y-0.5 py-2">
                    {item.children.map((child) => {
                      const active = pathname.startsWith(child.href);
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`flex items-center gap-2 px-2 py-2 rounded-md text-sm transition-colors ${
                            active
                              ? "bg-white text-black font-medium"
                              : "text-white/50 hover:text-white"
                          }`}
                        >
                          <Circle
                            size={5}
                            className={active ? "fill-black" : "fill-white/30"}
                          />
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          const Icon = item.icon!;
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href!}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-white text-black font-medium"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/6">
        <button className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors">
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}
