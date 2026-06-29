"use client";

import { parseVideo } from "@/shared/lib/media";

export default function MediaEmbed({ url }) {
  const info = parseVideo(url);
  if (!info) return null;

  return (
    <div className="relative w-full rounded-lg overflow-hidden bg-black">
      <div className="pt-[56.25%]" />
      {info.type === "iframe" ? (
        <iframe
          src={info.src}
          title={info.title || "Embedded video"}
          className="absolute inset-0 w-full h-full border-0"
          allow={info.allow}
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <video
          src={info.src}
          controls
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
    </div>
  );
}
