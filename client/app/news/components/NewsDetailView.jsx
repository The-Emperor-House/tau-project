"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Lightbox from "@/shared/components/site/Lightbox";
import MediaEmbed from "@/shared/components/ui/MediaEmbed";
import { canOptimize, photoCount } from "@/shared/lib/image";

import { resolveNewsUrl, newsLabel, formatNewsDate } from "@/shared/lib/news";
import { hasThai } from "@/shared/lib/utils";

const skeleton = "bg-white/[0.06] animate-pulse";

// initialItem มาจาก server (page.jsx) — ถ้าเป็น null แปลว่า server ดึงไม่สำเร็จ ให้ดึงเองฝั่ง client
export default function NewsDetailView({ id, initialItem = null }) {
  const [item, setItem] = useState(initialItem);
  const [loading, setLoading] = useState(initialItem == null);
  const [err, setErr] = useState("");
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    if (!id || initialItem != null) return;
    const ctrl = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/news/${id}`, { signal: ctrl.signal });
        if (!res.ok) throw new Error("ไม่พบข่าวหรือเกิดข้อผิดพลาด");
        setItem(await res.json());
      } catch (e) {
        if (e.name !== "AbortError") setErr(e.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, [id, initialItem]);

  const cover = resolveNewsUrl(item?.coverUrl);
  const images = useMemo(
    () => (item?.images || []).map((im) => resolveNewsUrl(im?.imageUrl)).filter(Boolean),
    [item]
  );
  // ข่าวที่เป็นวิดีโอ ไม่เอา cover เข้า lightbox (cover ไม่ได้แสดงในหน้า)
  const showCover = Boolean(cover && !item?.videoUrl);
  const gallery = useMemo(() => [...(showCover ? [cover] : []), ...images], [showCover, cover, images]);

  return (
    <div className="bg-site-bg text-white min-h-screen w-full flex flex-col" style={{ paddingTop: "var(--page-top)" }}>
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 pb-16 md:pb-24 flex-1 w-full">
        <Link
          href="/news"
          className="inline-flex items-center gap-2 mb-6 text-xs tracking-[0.2em] uppercase text-white/55 hover:text-site-accent transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          News &amp; Events
        </Link>

        {err && (
          <div className="mb-6 px-4 py-3 text-sm text-red-300 bg-red-500/10 border border-red-500/20">{err}</div>
        )}

        {/* Date line */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 md:gap-8 mb-8 md:mb-10">
          <span className="h-px bg-gradient-to-r from-transparent to-white/25" />
          {loading ? (
            <div className={`w-56 h-7 ${skeleton}`} />
          ) : (
            <p className="text-center font-extralight tracking-[0.2em] text-[1.1rem] md:text-[1.6rem] uppercase whitespace-nowrap">
              {item?.createdAt ? formatNewsDate(item.createdAt) : ""}
            </p>
          )}
          <span className="h-px bg-gradient-to-l from-transparent to-white/25" />
        </div>

        {/* 2-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10">
          {/* Left: media */}
          <div className="md:col-span-8">
            {loading ? (
              <div className={`w-full aspect-video ${skeleton}`} />
            ) : item?.videoUrl ? (
              <MediaEmbed url={item.videoUrl} />
            ) : showCover ? (
              <button
                type="button"
                onClick={() => setLightboxIndex(0)}
                aria-label="ดูรูปขนาดใหญ่"
                className="group relative block w-full aspect-video overflow-hidden bg-white/5 ring-1 ring-white/10 cursor-zoom-in"
              >
                <Image
                  src={cover}
                  alt={item?.heading1 || "news cover"}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 780px"
                  unoptimized={!canOptimize(cover)}
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </button>
            ) : null}
          </div>

          {/* Right: text */}
          <div className="md:col-span-4">
            {loading ? (
              <div className="space-y-3">
                <div className={`h-4 w-[35%] ${skeleton}`} />
                <div className={`h-9 w-[85%] ${skeleton}`} />
                <div className={`h-4 w-full ${skeleton}`} />
                <div className={`h-4 w-[90%] ${skeleton}`} />
              </div>
            ) : item ? (
              <>
                <p className={`text-site-accent uppercase mb-3 truncate ${hasThai(newsLabel(item.heading1)) ? "text-sm" : "text-[11px] tracking-[0.3em]"}`}>
                  {newsLabel(item.heading1)}
                </p>
                <h1 className="text-[1.5rem] md:text-[1.85rem] font-normal leading-snug mb-5 break-words">
                  {item.heading2 || item.heading1 || "-"}
                </h1>
                <span className="block h-px w-12 bg-site-accent mb-5" />
                {item.body && (
                  <p className="text-white/75 whitespace-pre-wrap leading-[1.95] break-words">{item.body}</p>
                )}
              </>
            ) : null}
          </div>
        </div>

        {/* Gallery */}
        {!loading && images.length > 0 && (
          <section className="mt-12 md:mt-16">
            <div className="flex items-baseline justify-between mb-5 pb-3 border-b border-white/10">
              <h2 className="text-xs tracking-[0.3em] uppercase text-white/70">Gallery</h2>
              <span className="text-xs tracking-[0.2em] text-white/40">{photoCount(images.length)}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {images.map((src, i) => (
                <button
                  key={`${i}-${src}`}
                  type="button"
                  onClick={() => setLightboxIndex((showCover ? 1 : 0) + i)}
                  aria-label={`ดูรูปที่ ${i + 1}`}
                  className="group relative aspect-square overflow-hidden bg-white/5 ring-1 ring-white/10 hover:ring-site-accent/50 cursor-zoom-in transition"
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 300px"
                    unoptimized={!canOptimize(src)}
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                  />
                </button>
              ))}
            </div>
          </section>
        )}
      </div>

      <Lightbox
        open={lightboxIndex !== null}
        onClose={() => setLightboxIndex(null)}
        images={gallery}
        startIndex={lightboxIndex ?? 0}
        title={item?.heading2 || item?.heading1}
      />
    </div>
  );
}
