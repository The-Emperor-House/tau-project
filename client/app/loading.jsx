"use client";

import { useTheme } from "@mui/material/styles";

export default function GlobalLoading({ open = false, text = "LOADING…" }) {
  const theme = useTheme();

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(255,255,255,0.9)",
        display: "grid",
        placeItems: "center",
        zIndex: 9999,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: 48,
            height: 48,
            margin: "0 auto 12px",
            border: "4px solid #e5e7eb",
            borderTopColor: theme.palette.primary.main,
            borderRadius: "50%",
            animation: "spin 0.9s linear infinite",
          }}
        />
        <div
          style={{
            letterSpacing: ".12em",
            fontWeight: 700,
            color: theme.palette.text.primary,
          }}
        >
          {text}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
