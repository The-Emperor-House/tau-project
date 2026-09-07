'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent } from '@/shared/components/ui/dialog';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const FALLBACK = '/images/default-data.jpg';

export default function GalleryModal({ open, onClose, data }) {
  const [index, setIndex] = useState(0);

  const gallery = data
    ? [data.coverUrl, ...(data.images?.map((img) => img.imageUrl) || [])].filter(Boolean)
    : [];

  useEffect(() => {
    if (open) setIndex(0);
  }, [open, data]);

  const prev = useCallback(
    () => setIndex((i) => (gallery.length ? (i - 1 + gallery.length) % gallery.length : 0)),
    [gallery.length]
  );
  const next = useCallback(
    () => setIndex((i) => (gallery.length ? (i + 1) % gallery.length : 0)),
    [gallery.length]
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, next, prev, onClose]);

  const touchRef = useRef({ x: 0, t: 0 });
  const onTouchStart = (e) => {
    const t = e.touches?.[0];
    if (!t) return;
    touchRef.current.x = t.clientX;
    touchRef.current.t = Date.now();
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

  if (!data) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="max-w-none w-full h-screen p-0 bg-black border-none rounded-none"
      >
        <button
          aria-label="close"
          onClick={onClose}
          className="absolute top-3 right-3 z-[2] w-10 h-10 rounded-full flex items-center justify-center text-white bg-black/40 hover:bg-black/60 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <p className="absolute top-4 left-4 z-[2] text-white font-bold text-sm md:text-base truncate max-w-[60%]">
          {data.name}
        </p>

        <div
          className="relative grid place-items-center min-h-screen bg-black"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {gallery.length > 0 ? (
            <img
              src={gallery[index] || FALLBACK}
              alt={data.name || 'project'}
              onError={(e) => (e.currentTarget.src = FALLBACK)}
              className="max-w-full max-h-[90vh] object-contain block"
            />
          ) : (
            <p className="text-white/70">ไม่มีภาพเพิ่มเติมสำหรับโครงการนี้</p>
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
              <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
                {index + 1} / {gallery.length}
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
