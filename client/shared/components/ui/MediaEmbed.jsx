"use client";

import { Box } from "@mui/material";
import { parseVideo } from "@/shared/lib/media";

export default function MediaEmbed({ url }) {
  const info = parseVideo(url);
  if (!info) return null;

  return (
    <Box sx={{ position: "relative", width: "100%", borderRadius: 2, overflow: "hidden", bgcolor: "#000" }}>
      {/* 16:9 */}
      <Box sx={{ pt: "56.25%" }} />
      {info.type === "iframe" ? (
        <iframe
          src={info.src}
          title={info.title || "Embedded video"}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
          allow={info.allow}
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <video
          src={info.src}
          controls
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
      )}
    </Box>
  );
}