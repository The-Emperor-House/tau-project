"use client";

import Link from "next/link";
import { Box } from "@mui/material";
import { alpha } from "@mui/material/styles";

export default function NavLinkItem({
  href,
  label,
  active,
  onClick,
  dense = false, // เพิ่มโหมดแน่น
}) {
  return (
    <Box
      component={Link}
      href={href}
      onClick={onClick}
      sx={(t) => ({
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        textDecoration: "none",
        // ย่อ-ขยายอัตโนมัติ: max ~1.3rem, min ~0.95/0.9 ตามโหมด
        fontSize: dense
          ? "clamp(0.9rem, 0.9vw + 0.55rem, 1.15rem)"
          : "clamp(0.95rem, 1.0vw + 0.65rem, 1.3rem)",
        lineHeight: 1.6,
        whiteSpace: "nowrap",         // กันตัดบรรทัดเมื่อมีหลายเมนู
        wordBreak: "keep-all",
        color: "common.white",
        textShadow: `0 2px 4px ${alpha(t.palette.common.black, 0.6)}`,
        transition: "color .25s ease",
        px: dense ? 0.5 : 0.75,       // โหมดแน่นลด padding
        py: 0.25,
        borderRadius: 1,
        "&:hover": { color: "primary.main" },
        "&::after": {
          content: '""',
          position: "absolute",
          left: 0,
          right: 0,
          bottom: -6,
          height: 2,
          backgroundColor: t.palette.primary.main,
          transform: "scaleX(0)",
          transformOrigin: "left center",
          transition: "transform .25s ease",
          borderRadius: 1,
        },
        ...(active && {
          color: "primary.main",
          "&::after": { transform: "scaleX(1)" },
        }),
        "&:focus-visible": {
          outline: `2px solid ${alpha(t.palette.primary.main, 0.5)}`,
          outlineOffset: 2,
        },
      })}
    >
      {label}
    </Box>
  );
}
