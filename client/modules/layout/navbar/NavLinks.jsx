"use client";

import { Box } from "@mui/material";
import { usePathname } from "next/navigation";
import NavLinkItem from "./NavLinkItem";

export default function NavLinks({ links, onSmoothScroll }) {
  const pathname = usePathname() || "/";
  const isActive = (href) => pathname === href || pathname.startsWith(href + "/");

  return (
    <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 3 }}>
      {links.map((link) => (
        <NavLinkItem
          key={link.href}
          href={link.href}
          label={link.label}
          active={isActive(link.href)}
          onClick={(e) => onSmoothScroll?.(e, link.href)}
        />
      ))}
    </Box>
  );
}
