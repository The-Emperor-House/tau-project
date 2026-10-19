"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/shared/lib/utils";
import { canOptimize } from "@/shared/lib/image";

const CARD_SIZES = "(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 400px";

/**
 * การ์ด "รูปด้านบน + แผงข้อความ + ปุ่ม VIEW ด้านล่าง" (หน้า projects / showroom)
 * ส่ง href = ลิงก์ไปหน้าอื่น, ส่ง onClick = เปิด lightbox
 */
export default function InfoCard({ href, onClick, image, alt, aspect = "4 / 3", buttonLabel = "View", align = "center", priority, children }) {
  const [failed, setFailed] = useState(false);
  const Wrapper = href ? Link : "button";
  const wrapperProps = href ? { href } : { type: "button", onClick };

  return (
    <Wrapper
      {...wrapperProps}
      className="group flex flex-col h-full w-full text-left bg-white/[0.04] ring-1 ring-white/10 hover:ring-site-accent/50 transition-[box-shadow,transform] duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-20px_rgba(0,0,0,0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-site-accent"
    >
      <div className="relative w-full overflow-hidden bg-black/20" style={{ aspectRatio: aspect }}>
        {image && !failed ? (
          <Image
            src={image}
            alt={alt || ""}
            fill
            priority={priority}
            sizes={CARD_SIZES}
            unoptimized={!canOptimize(image)}
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-[11px] tracking-[0.3em] text-white/30">NO IMAGE</div>
        )}
      </div>

      <div className={cn("flex flex-col flex-1 px-5 md:px-6 py-5 md:py-6", align === "center" ? "text-center items-center" : "text-left")}>
        <div className="flex-1 w-full">{children}</div>
        <span className="mt-5 md:mt-6 w-full py-2.5 text-center text-xs tracking-[0.3em] uppercase text-site-accent border border-site-accent/60 transition-colors group-hover:bg-site-accent group-hover:text-black">
          {buttonLabel}
        </span>
      </div>
    </Wrapper>
  );
}

export function InfoCardSkeleton({ aspect = "4 / 3" }) {
  return (
    <div aria-hidden className="bg-white/[0.04] ring-1 ring-white/10">
      <div className="bg-white/[0.06] animate-pulse" style={{ aspectRatio: aspect }} />
      <div className="px-5 py-6 space-y-2.5">
        <div className="h-4 w-3/4 mx-auto bg-white/[0.06] animate-pulse" />
        <div className="h-3 w-1/2 mx-auto bg-white/[0.06] animate-pulse" />
        <div className="h-9 w-full mt-4 bg-white/[0.06] animate-pulse" />
      </div>
    </div>
  );
}
