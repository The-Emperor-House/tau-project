"use client";

import Link from "next/link";
import { cn } from "@/shared/lib/cn";

export default function NavLinkItem({ href, label, active, onClick, dense = false }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "relative inline-flex items-center whitespace-nowrap no-underline text-white transition-colors duration-200 rounded px-2 py-0.5",
        "hover:text-primary",
        "after:absolute after:left-0 after:right-0 after:-bottom-1.5 after:h-0.5 after:bg-primary after:rounded after:transition-transform after:duration-200 after:origin-left",
        active ? "text-primary after:scale-x-100" : "after:scale-x-0",
        dense ? "text-[clamp(0.9rem,0.9vw+0.55rem,1.15rem)]" : "text-[clamp(0.95rem,1vw+0.65rem,1.3rem)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
      )}
      style={{ textShadow: "0 2px 4px rgba(0,0,0,0.6)" }}
    >
      {label}
    </Link>
  );
}
