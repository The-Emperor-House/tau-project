"use client";

import Link from "next/link";
import { Separator } from "@/shared/components/ui/separator";
import {
  Palette, Layers, Armchair, Newspaper,
  Mail, User, LogOut,
} from "lucide-react";
import { cn } from "@/shared/lib/cn";
import useModalContext from "@/shared/hooks/useModalContext";

const MENU = [
  { href: "/dashboard/design",    label: "Design",   icon: Palette },
  { href: "/dashboard/project",   label: "Project",  icon: Layers },
  { href: "/dashboard/furniture", label: "Showroom", icon: Armchair },
  { href: "/dashboard/news",      label: "News",     icon: Newspaper },
  { href: "/dashboard/contact",   label: "Contact",  icon: Mail },
];

export default function AccountPanel({ onClose, onLogout }) {
  const { confirm, showLoading, hideLoading } = useModalContext();

  const handleLogoutClick = async () => {
    const ok = await confirm({
      title: "Sign out?",
      message: "Do you want to sign out now?",
      confirmText: "Sign out",
      cancelText: "Cancel",
      destructive: true,
    });
    if (!ok) return;
    onClose?.();
    showLoading("Signing out...");
    try {
      await onLogout?.();
    } finally {
      hideLoading();
    }
  };

  return (
    <div className="flex flex-col pt-4">
      <p className="px-6 pb-2 text-xs font-bold tracking-widest text-primary uppercase">
        Dashboard
      </p>
      {MENU.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={onClose}
          className="flex items-center gap-3 px-6 py-3 text-sm text-white hover:bg-white/5 transition-colors"
        >
          <Icon className="w-4 h-4 text-primary shrink-0" />
          {label}
        </Link>
      ))}

      <Separator className="my-2 bg-white/10" />

      <Link
        href="/profile"
        onClick={onClose}
        className="flex items-center gap-3 px-6 py-3 text-sm text-white hover:bg-white/5 transition-colors"
      >
        <User className="w-4 h-4 text-primary shrink-0" />
        Profile
      </Link>

      <button
        onClick={handleLogoutClick}
        className="flex items-center gap-3 px-6 py-3 text-sm text-white hover:bg-white/5 transition-colors text-left"
      >
        <LogOut className="w-4 h-4 text-primary shrink-0" />
        Logout
      </button>
    </div>
  );
}
