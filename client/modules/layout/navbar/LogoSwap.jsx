"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { cn } from "@/shared/lib/cn";

export default function LogoSwap({
  href = "/",
  lightSrc = "/logo/LOGO NEW TAURUS WHITE.png",
  accentSrc = "/logo/LOGO NEW TAURUS ORANGE.png",
  width = 160,
  height = 60,
  showOnXs = true,
}) {
  const [hover, setHover] = useState(false);

  useEffect(() => {
    const img = new window.Image();
    img.decoding = "async";
    img.loading = "eager";
    img.src = accentSrc;
  }, [accentSrc]);

  return (
    <Link
      href={href}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={cn(
        "relative flex items-center no-underline",
        !showOnXs && "hidden md:flex"
      )}
      style={{ width, height }}
    >
      <div className="relative" style={{ width, height }}>
        <Image
          src={lightSrc}
          alt="Taurus Logo"
          width={width}
          height={height}
          priority
          draggable={false}
          className="absolute inset-0 w-full h-full object-contain transition-opacity duration-200"
          style={{ opacity: hover ? 0 : 1 }}
        />
        <Image
          src={accentSrc}
          alt=""
          aria-hidden
          width={width}
          height={height}
          draggable={false}
          className="absolute inset-0 w-full h-full object-contain transition-opacity duration-200"
          style={{ opacity: hover ? 1 : 0 }}
        />
      </div>
    </Link>
  );
}
