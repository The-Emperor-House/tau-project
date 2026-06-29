"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import { Skeleton } from "@/shared/components/ui/skeleton";

const ACCENT = "#BFA68A";
const FALLBACK = "/images/default-data.jpg";

export default function FurnitureCard({ item, onClick }) {
  const srcCandidate = useMemo(
    () =>
      item?.coverUrl ||
      item?.imageUrl ||
      item?.images?.[0]?.imageUrl ||
      FALLBACK,
    [item]
  );

  const [loaded, setLoaded] = useState(false);
  const [imgSrc, setImgSrc] = useState(srcCandidate);
  useEffect(() => setImgSrc(srcCandidate), [srcCandidate]);

  const dims = [item?.width, item?.depth, item?.height].every(
    (n) => typeof n === "number"
  )
    ? `W${item.width} x D${item.depth} x H${item.height} cm`
    : "";

  const priceText =
    typeof item?.price === "number"
      ? `${item.price.toLocaleString("th-TH")} บาท`
      : "";

  return (
    <div className="w-full overflow-hidden">
      <div
        className="relative w-full cursor-pointer aspect-video"
        onClick={() => onClick?.(item)}
      >
        {!loaded && (
          <Skeleton className="absolute inset-0 w-full h-full" />
        )}
        <Image
          src={imgSrc}
          alt={item?.name || "furniture"}
          fill
          sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
          unoptimized
          onLoad={() => setLoaded(true)}
          onError={() => {
            if (imgSrc !== FALLBACK) setImgSrc(FALLBACK);
          }}
        />
      </div>

      <div className="bg-white px-5 md:px-6 py-5 md:py-6">
        <p className="text-[#111] text-[1.05rem] md:text-[1.15rem] font-bold">
          {item?.name || ""}
        </p>
        {item?.details && (
          <p className="text-[#111] text-[0.95rem] md:text-[1rem] mt-1">
            {item.details}
          </p>
        )}
        <div className="flex flex-wrap gap-4 mt-2">
          {dims && (
            <p className="text-[#111] text-[0.95rem] md:text-[1rem]">{dims}</p>
          )}
          {priceText && (
            <p className="text-[#111] text-[0.95rem] md:text-[1rem] font-bold">
              {priceText}
            </p>
          )}
        </div>
        <button
          onClick={() => onClick?.(item)}
          className="mt-5 md:mt-6 w-full py-2.5 md:py-3 font-extrabold tracking-[0.12em] text-black transition-colors text-[1rem] md:text-[1.05rem]"
          style={{ backgroundColor: ACCENT }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#a88e72")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = ACCENT)}
        >
          VIEW
        </button>
      </div>
    </div>
  );
}
