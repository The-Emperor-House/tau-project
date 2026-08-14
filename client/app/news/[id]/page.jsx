"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Skeleton } from "@/shared/components/ui/skeleton";
import MediaEmbed from "@/shared/components/ui/MediaEmbed";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { resolveNewsUrl, extractNewsLabel, formatNewsDate, NEWS_FALLBACK_COVER } from "@/shared/lib/news";

const FALLBACK_COVER = NEWS_FALLBACK_COVER;
const ACCENT = "#cc8f2a";
const resolveUrl = resolveNewsUrl;
const extractLabel = extractNewsLabel;
const formatDateLine = formatNewsDate;

export default function NewsDetail() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [item, setItem] = useState(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const gallery = useMemo(() => {
    if (!item) return [];
    const pics = [];
    if (item.coverUrl && !item.videoUrl) pics.push(resolveUrl(item.coverUrl));
    if (Array.isArray(item.images)) {
      for (const im of item.images) if (im?.imageUrl) pics.push(resolveUrl(im.imageUrl));
    }
    return pics.filter(Boolean);
  }, [item]);

  const openLightbox = useCallback((index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  const prev = useCallback(
    () => setLightboxIndex((i) => (gallery.length ? (i - 1 + gallery.length) % gallery.length : 0)),
    [gallery.length]
  );
  const next = useCallback(
    () => setLightboxIndex((i) => (gallery.length ? (i + 1) % gallery.length : 0)),
    [gallery.length]
  );

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e) => {
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "Escape") setLightboxOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen, next, prev]);

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

  useEffect(() => {
    if (!id) return;
    const ctrl = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/news/${id}`, {
          signal: ctrl.signal,
        });
        if (!res.ok) throw new Error("ไม่พบข่าวหรือเกิดข้อผิดพลาด");
        const data = await res.json();
        setItem(data);
        setImgSrc(resolveUrl(data?.coverUrl) || FALLBACK_COVER);
      } catch (e) {
        if (e.name !== "AbortError") setErr(e.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, [id]);

  const dateLine = useMemo(
    () => (item?.createdAt ? formatDateLine(item.createdAt) : ""),
    [item?.createdAt]
  );

  return (
    <div
      className="bg-black text-white min-h-screen w-full flex flex-col"
      style={{ paddingTop: "var(--page-top)" }}
    >
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 pb-16 flex-1 w-full">
        {err && (
          <div className="mb-4 px-4 py-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg">
            {err}
          </div>
        )}

        {/* Date line */}
        <hr className="border-white/12 mb-3" />
        {loading ? (
          <Skeleton className="w-64 h-8 mx-auto mb-6 md:mb-8" />
        ) : (
          <p className="text-center font-extrabold tracking-[0.08em] text-[1.2rem] md:text-[1.8rem] uppercase mb-6 md:mb-8 truncate">
            {dateLine}
          </p>
        )}

        {/* 2-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8">
          {/* Left: media */}
          <div className="md:col-span-8">
            <div className="relative w-full aspect-video overflow-hidden rounded-xl bg-neutral-900">
              {loading ? (
                <Skeleton className="absolute inset-0 w-full h-full" />
              ) : item?.videoUrl ? (
                <div className="absolute inset-0">
                  <MediaEmbed url={item.videoUrl} />
                </div>
              ) : (
                <img
                  src={imgSrc || FALLBACK_COVER}
                  alt={item?.heading1 || "news cover"}
                  onError={() => setImgSrc(FALLBACK_COVER)}
                  className="absolute inset-0 w-full h-full object-cover block"
                  style={{ cursor: gallery.length ? "zoom-in" : "default" }}
                  loading="eager"
                  onClick={() => { if (gallery.length) openLightbox(0); }}
                />
              )}
            </div>
          </div>

          {/* Right: text */}
          <div className="md:col-span-4">
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-7 w-[35%]" />
                <Skeleton className="h-10 w-[80%]" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[95%]" />
                <Skeleton className="h-4 w-[90%]" />
              </div>
            ) : (
              <>
                <p
                  className="font-extrabold tracking-[0.06em] uppercase text-[1rem] md:text-[1.15rem] mb-2 truncate"
                  style={{ color: ACCENT }}
                >
                  {extractLabel(item?.heading1)}
                </p>
                <p className="font-black text-[1.6rem] md:text-[2rem] leading-tight mb-4 line-clamp-3 break-words">
                  {item?.heading2 || item?.heading1 || "-"}
                </p>
                {item?.body && (
                  <p className="whitespace-pre-wrap leading-[1.9] overflow-wrap-anywhere">
                    {item.body}
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Gallery */}
        {!loading && (item?.images?.length ?? 0) > 0 && (
          <div className="relative z-0 mt-8">
            <p className="font-bold text-lg mb-4 truncate">
              Gallery ({item.images.length})
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {item.images.map((img, i) => {
                const src = resolveUrl(img?.imageUrl);
                return (
                  <div
                    key={img?.id ?? i}
                    className="relative w-full aspect-square overflow-hidden rounded bg-neutral-900 cursor-zoom-in"
                    onClick={() => {
                      const base = (item?.coverUrl && !item?.videoUrl) ? 1 : 0;
                      openLightbox(base + i);
                    }}
                  >
                    <img
                      src={src || FALLBACK_COVER}
                      alt=""
                      loading="lazy"
                      onError={(e) => { e.currentTarget.src = FALLBACK_COVER; }}
                      className="absolute inset-0 w-full h-full object-cover block"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={(o) => !o && setLightboxOpen(false)}>
        <DialogContent
          showCloseButton={false}
          className="max-w-none w-full h-screen p-0 bg-black border-none rounded-none"
        >
          <button
            aria-label="close"
            onClick={() => setLightboxOpen(false)}
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
                src={gallery[lightboxIndex] || FALLBACK_COVER}
                alt=""
                onError={(e) => (e.currentTarget.src = FALLBACK_COVER)}
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
                <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
                  {lightboxIndex + 1} / {gallery.length}
                </p>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
