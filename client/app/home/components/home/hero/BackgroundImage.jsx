"use client";

import Image from "next/image";
import { useState } from "react";

const dimToBg = (dim) =>
  typeof dim === "number"
    ? `rgba(0,0,0,${dim})`
    : Object.fromEntries(
        Object.entries(dim || {}).map(([k, v]) => [k, `rgba(0,0,0,${v})`])
      );

export default function BackgroundImage({
  src,
  alt,
  dim = 0,
  gradient = false,
  priority = false,
  objectPosition = "center",
}) {
  const [loaded, setLoaded] = useState(false);
  const dimBg = dimToBg(dim);
  const dimValue = typeof dimBg === "string" ? dimBg : dimBg.md || dimBg.xs || "rgba(0,0,0,0)";

  return (
    <div className="absolute inset-0 z-0">
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="100vw"
        draggable={false}
        onLoad={() => setLoaded(true)}
        style={{
          objectFit: "cover",
          objectPosition,
          opacity: loaded ? 1 : 0,
          transition: "opacity .6s ease",
          willChange: "opacity",
        }}
      />

      {gradient && (
        <div
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{ background: "linear-gradient(135deg, rgba(0,0,0,.45), transparent 50%, rgba(0,0,0,.2))" }}
        />
      )}

      {((typeof dim === "number" && dim > 0) || typeof dim === "object") && (
        <div
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{ backgroundColor: dimValue }}
        />
      )}
    </div>
  );
}
