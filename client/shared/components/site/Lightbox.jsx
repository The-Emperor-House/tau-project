"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/shared/components/ui/dialog";

/**
 * ดูรูปเต็มจอ ใช้ร่วมกันทุกหน้า — ปุ่มลูกศร/คีย์บอร์ด/ปัดนิ้วเพื่อเลื่อนรูป
 * @param {string[]} images
 * @param {number} startIndex รูปแรกที่จะแสดงเมื่อเปิด
 */
export default function Lightbox({ open, onClose, images = [], startIndex = 0, title, caption }) {
  const [index, setIndex] = useState(startIndex);
  const count = images.length;

  useEffect(() => {
    if (open) setIndex(Math.min(Math.max(startIndex, 0), Math.max(count - 1, 0)));
  }, [open, startIndex, count]);

  const prev = useCallback(() => setIndex((i) => (count ? (i - 1 + count) % count : 0)), [count]);
  const next = useCallback(() => setIndex((i) => (count ? (i + 1) % count : 0)), [count]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, next, prev]);

  const touch = useRef({ x: 0, t: 0 });
  const onTouchStart = (e) => {
    const t = e.touches?.[0];
    if (t) touch.current = { x: t.clientX, t: Date.now() };
  };
  const onTouchEnd = (e) => {
    const t = e.changedTouches?.[0];
    if (!t) return;
    const dx = t.clientX - touch.current.x;
    if (Date.now() - touch.current.t < 600 && Math.abs(dx) > 40) (dx < 0 ? next : prev)();
  };

  const navButton = "absolute top-1/2 -translate-y-1/2 w-11 h-11 grid place-items-center text-white/80 hover:text-white bg-white/5 hover:bg-white/15 transition-colors";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="max-w-none sm:max-w-none w-screen h-dvh p-0 bg-black border-none rounded-none"
      >
        <DialogTitle className="sr-only">{title || "Gallery"}</DialogTitle>

        <div className="absolute top-0 inset-x-0 z-[2] flex items-center justify-between gap-4 px-4 md:px-6 py-4">
          <p className="text-white/80 text-sm tracking-[0.15em] uppercase truncate">{title}</p>
          <div className="flex items-center gap-4 shrink-0">
            {count > 1 && <span className="text-white/50 text-xs tracking-[0.2em]">{index + 1} / {count}</span>}
            <button aria-label="close" onClick={onClose} className="w-10 h-10 grid place-items-center text-white/80 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* absolute inset-0 + ขนาดรูปเป็นหน่วยจอ (vw/dvh) — max-h-full ใช้ไม่ได้เพราะ DialogContent เป็น grid ที่สูงตามเนื้อหา
            รูปจะแสดงขนาดจริงจนล้นจอ เว้นที่ด้านบน/ล่างให้แถบชื่อและ caption */}
        <div className="absolute inset-0 flex items-center justify-center" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          {count > 0 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={images[index]}
              src={images[index]}
              alt=""
              className="block w-auto h-auto max-w-[calc(100vw-2rem)] md:max-w-[calc(100vw-10rem)] max-h-[calc(100dvh-9rem)] object-contain select-none animate-in fade-in-0 duration-300"
            />
          ) : (
            <p className="text-white/60 text-sm">ไม่มีรูปภาพ</p>
          )}

          {count > 1 && (
            <>
              <button aria-label="previous" onClick={prev} className={`${navButton} left-2 md:left-6`}>
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button aria-label="next" onClick={next} className={`${navButton} right-2 md:right-6`}>
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {caption && (
          <p className="absolute bottom-0 inset-x-0 px-4 md:px-6 py-4 text-center text-white/60 text-sm line-clamp-2">{caption}</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
