"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  Dialog, DialogContent,
} from "@/shared/components/ui/dialog";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export default function GalleryViewer({
  images = [],
  aspectRatio = "16 / 9",
  initialIndex = 0,
  thumbHeight = 70,
}) {
  const imgs = (images || []).filter(Boolean);
  const [index, setIndex] = useState(clamp(initialIndex, 0, Math.max(0, imgs.length - 1)));
  const [open, setOpen] = useState(false);
  const trackRef = useRef(null);
  const touchRef = useRef({ x: 0, y: 0, t: 0 });

  useEffect(() => {
    setIndex((i) => clamp(i, 0, Math.max(0, imgs.length - 1)));
  }, [imgs.length]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const prev = () => setIndex((i) => (i - 1 + imgs.length) % imgs.length);
  const next = () => setIndex((i) => (i + 1) % imgs.length);

  const onTouchStart = (e) => {
    const t = e.touches?.[0];
    if (!t) return;
    touchRef.current = { x: t.clientX, y: t.clientY, t: Date.now() };
  };
  const onTouchEnd = (e) => {
    const t = e.changedTouches?.[0];
    if (!t) return;
    const dx = t.clientX - touchRef.current.x;
    const dt = Date.now() - touchRef.current.t;
    if (dt < 600 && Math.abs(dx) > 40) {
      if (dx < 0) next();
      else prev();
    }
  };

  const thumbs = useMemo(() => imgs.map((src, i) => ({ src, i })), [imgs]);

  if (!imgs.length) return null;

  return (
    <div>
      {/* Inline viewer */}
      <div
        className="relative w-full overflow-hidden rounded-lg bg-[#111]"
        style={{ aspectRatio }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <img
          src={imgs[index]}
          alt=""
          onClick={() => setOpen(true)}
          className="absolute inset-0 w-full h-full object-cover cursor-zoom-in block"
          loading="eager"
        />

        {imgs.length > 1 && (
          <>
            <button
              aria-label="previous"
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/35 text-white hover:bg-black/55 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              aria-label="next"
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/35 text-white hover:bg-black/55 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {imgs.length > 1 && (
        <div
          ref={trackRef}
          className="mt-3 flex gap-2 overflow-x-auto pb-1"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {thumbs.map(({ src, i }) => (
            <div
              key={`${src}-${i}`}
              onClick={() => setIndex(i)}
              className="relative flex-none overflow-hidden rounded cursor-pointer"
              style={{
                height: thumbHeight,
                aspectRatio: "1 / 1",
                outline: i === index ? "2px solid #BFA68A" : "1px solid rgba(255,255,255,.15)",
              }}
            >
              <img
                src={src}
                alt=""
                loading="lazy"
                className="w-full h-full object-cover block"
              />
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <Dialog open={open} onOpenChange={(o) => !o && setOpen(false)}>
        <DialogContent
          className="max-w-5xl w-full bg-black text-white border-none p-0 sm:p-0"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="relative grid place-items-center min-h-[60vh] sm:min-h-[600px] bg-black">
            <img
              src={imgs[index]}
              alt=""
              className="max-w-full max-h-[90vh] object-contain block"
            />

            {imgs.length > 1 && (
              <>
                <button
                  aria-label="previous"
                  onClick={prev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/35 text-white hover:bg-black/55 transition-colors z-10"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  aria-label="next"
                  onClick={next}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/35 text-white hover:bg-black/55 transition-colors z-10"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
