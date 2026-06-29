"use client";

import { usePathname } from "next/navigation";
import NavLinkItem from "./NavLinkItem";

export default function NavLinks({ links, onSmoothScroll, dense }) {
  const pathname = usePathname() || "/";
  const isActive = (href) => pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="hidden md:flex items-center gap-3">
      {links.map((link) => (
        <NavLinkItem
          key={link.href}
          href={link.href}
          label={link.label}
          active={isActive(link.href)}
          onClick={(e) => onSmoothScroll?.(e, link.href)}
          dense={dense}
        />
      ))}
    </div>
  );
}
