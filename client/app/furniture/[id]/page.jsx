"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const BG = "#404040";
const FALLBACK = "/images/default-data.jpg";

export default function FurnitureDetail() {
  const { id } = useParams();

  const [item, setItem] = useState(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);

  const gallery = useMemo(() => {
    if (!item) return [];
    const pics = [];
    if (item.coverUrl) pics.push(item.coverUrl);
    if (Array.isArray(item.images)) {
      for (const im of item.images) if (im?.imageUrl) pics.push(im.imageUrl);
    }
    return pics;
  }, [item]);

  const coverIndex = item?.coverUrl ? 0 : null;

  useEffect(() => {
    if (!id) return;
    const ctrl = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/furniture/${id}`,
          { signal: ctrl.signal }
        );
        const data = res.ok ? await res.json() : null;
        setItem(data);
        setImgSrc(data?.coverUrl || FALLBACK);
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, [id]);

  const dims = useMemo(() => {
    if (!item) return "";
    const { width, depth, height } = item;
    if ([width, depth, height].every((n) => typeof n === "number")) {
      return `W${width} x D${depth} x H${height} cm`;
    }
    return "";
  }, [item]);

  const prev = useCallback(
    () => setStartIndex((i) => (gallery.length ? (i - 1 + gallery.length) % gallery.length : 0)),
    [gallery.length]
  );
  const next = useCallback(
    () => setStartIndex((i) => (gallery.length ? (i + 1) % gallery.length : 0)),
    [gallery.length]
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, next, prev]);

  const touchRef = useState({ x: 0, t: 0 })[0];
  const onTouchStart = (e) => {
    const t = e.touches?.[0];
    if (!t) return;
    touchRef.x = t.clientX;
    touchRef.t = Date.now();
  };
  const onTouchEnd = (e) => {
    const t = e.changedTouches?.[0];
    if (!t) return;
    const dx = t.clientX - touchRef.x;
    const dt = Date.now() - touchRef.t;
    if (dt < 600 && Math.abs(dx) > 40) {
      if (dx < 0) next();
      else prev();
    }
  };

  return (
    <div
      className="text-white min-h-screen pb-16"
      style={{ backgroundColor: BG, paddingTop: "var(--page-top)" }}
    >
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8">
          {/* Cover image */}
          <div className="md:col-span-7">
            <div
              className="relative w-full aspect-video overflow-hidden rounded-xl bg-neutral-900"
              style={{ cursor: gallery.length ? "zoom-in" : "default" }}
              onClick={() => {
                if (!gallery.length) return;
                setStartIndex(coverIndex ?? 0);
                setOpen(true);
              }}
            >
              {loading ? (
                <Skeleton className="absolute inset-0 w-full h-full" />
              ) : (
                <img
                  src={imgSrc || FALLBACK}
                  alt={item?.name || "furniture"}
                  onError={() => setImgSrc(FALLBACK)}
                  className="absolute inset-0 w-full h-full object-cover block"
                />
              )}
            </div>
          </div>

          {/* Details */}
          <div className="md:col-span-5">
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-9 w-[70%]" />
                <Skeleton className="h-6 w-[50%]" />
                <Skeleton className="h-4 w-[90%]" />
                <Skeleton className="h-4 w-[80%]" />
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-black mb-2">{item?.name}</h1>
                <p className="font-extrabold uppercase tracking-[0.06em] mb-2" style={{ color: "#BFA68A" }}>
                  {item?.type?.replace("_", "-")}
                </p>
                {dims && <p className="mb-3">{dims}</p>}
                {typeof item?.price === "number" && (
                  <p className="font-extrabold mb-4">
                    {item.price.toLocaleString("th-TH")} บาท
                  </p>
                )}
                {item?.details && (
                  <p className="whitespace-pre-wrap leading-[1.8]">{item.details}</p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Gallery */}
        {!loading && gallery.length > 0 && (
          <div className="mt-8">
            <p className="font-bold text-lg mb-4">Gallery ({gallery.length})</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {item.images.map((img, i) => (
                <div
                  key={img?.id ?? i}
                  className="relative w-full aspect-square overflow-hidden rounded bg-neutral-900 cursor-zoom-in"
                  onClick={() => {
                    const base = coverIndex === 0 ? 1 : 0;
                    setStartIndex(base + i);
                    setOpen(true);
                  }}
                >
                  <img
                    src={img.imageUrl || FALLBACK}
                    alt=""
                    loading="lazy"
                    onError={(e) => { e.currentTarget.src = FALLBACK; }}
                    className="absolute inset-0 w-full h-full object-cover block"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      <Dialog open={open} onOpenChange={(o) => !o && setOpen(false)}>
        <DialogContent
          showCloseButton={false}
          className="max-w-none w-full h-screen p-0 bg-black border-none rounded-none"
        >
          <button
            aria-label="close"
            onClick={() => setOpen(false)}
            className="absolute top-3 right-3 z-[2] w-10 h-10 rounded-full flex items-center justify-center text-white bg-black/40 hover:bg-black/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div
            className="relative grid place-items-center min-h-screen bg-black"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            {gallery.length > 0 && (
              <img
                src={gallery[startIndex] || FALLBACK}
                alt=""
                onError={(e) => (e.currentTarget.src = FALLBACK)}
                className="max-w-full max-h-[90vh] object-contain block"
              />
            )}

            {gallery.length > 1 && (
              <>
                <button
                  aria-label="previous"
                  onClick={prev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white bg-black/35 hover:bg-black/55 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  aria-label="next"
                  onClick={next}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white bg-black/35 hover:bg-black/55 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
