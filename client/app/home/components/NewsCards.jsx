"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Skeleton } from "@/shared/components/ui/skeleton";
import MediaEmbed from "@/shared/components/ui/MediaEmbed";
import { resolveNewsUrl, extractNewsLabel, formatNewsDate, NEWS_FALLBACK_COVER } from "@/shared/lib/news";

const ACCENT = "#BFA68A";
const FRAME = "#333";
const FALLBACK_COVER = NEWS_FALLBACK_COVER;
const MAX_ITEMS = 3;

export default function LatestNews({ title = "News & Events", showViewAll = true }) {
  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setErr("");
        let list = [];

        const rFeatured = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/news?featured=true`, { signal: ctrl.signal });
        if (rFeatured.ok) {
          const data = await rFeatured.json();
          if (Array.isArray(data)) list = data;
        }

        if (!list.length) {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/news?limit=${MAX_ITEMS}`, { signal: ctrl.signal });
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) list = data;
          }
        }

        setItems(list.slice(0, MAX_ITEMS));
      } catch (e) {
        if (e.name !== "AbortError") setErr(e.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, []);

  if (err) {
    return (
      <div className="bg-white px-4 md:px-6 py-12 md:py-16">
        <div className="px-4 py-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">{err}</div>
      </div>
    );
  }

  const showEmpty = !loading && (!items || items.length === 0);

  return (
    <div className="bg-white text-foreground px-4 md:px-6 py-12 md:py-16">
      {/* Header */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 mb-6">
        <div className="h-px bg-black" />
        <p className="font-black tracking-[0.12em] text-[1.4rem] md:text-[2rem] uppercase text-center">
          {title}
        </p>
        <div className="h-px bg-black" />
      </div>

      {showEmpty ? null : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {(loading || !items ? Array.from({ length: MAX_ITEMS }) : items).map((news, i) => (
            <NewsCard key={news?.id ?? i} news={news} loading={loading || !news} />
          ))}
        </div>
      )}

      {showViewAll && !showEmpty && (
        <div className="flex justify-center mt-10">
          <Link
            href="/news"
            className="px-8 py-3 rounded-full font-bold tracking-[0.12em] border transition-colors hover:bg-[#BFA68A]/10"
            style={{ borderColor: ACCENT, color: ACCENT }}
          >
            VIEW ALL
          </Link>
        </div>
      )}
    </div>
  );
}

function NewsCard({ news, loading }) {
  const cover = resolveNewsUrl(news?.coverUrl) || FALLBACK_COVER;

  if (loading) {
    return (
      <div>
        <div style={{ border: `10px solid ${FRAME}`, borderRadius: 4 }}>
          <div className="relative aspect-video bg-neutral-100">
            <Skeleton className="absolute inset-0 w-full h-full" />
          </div>
        </div>
        <div className="space-y-2 mt-3">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-5 w-4/5" />
          <Skeleton className="h-4 w-3/5" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ border: `10px solid ${FRAME}`, borderRadius: 4 }}>
        <div className="relative aspect-video overflow-hidden bg-neutral-100">
          {news.videoUrl ? (
            <MediaEmbed url={news.videoUrl} />
          ) : (
            <img
              src={cover}
              alt={news.heading1 || "news cover"}
              onError={(e) => (e.currentTarget.src = FALLBACK_COVER)}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
        </div>
      </div>

      <div className="mt-3">
        <p className="font-extrabold text-sm mb-1">{formatNewsDate(news.createdAt)}</p>
        <p className="font-extrabold tracking-[0.06em] uppercase text-sm mb-1" style={{ color: ACCENT }}>
          {extractNewsLabel(news.heading1)}
        </p>
        <p className="font-black text-[1.1rem] leading-tight mb-2 line-clamp-2">
          {news.heading2 || news.heading1}
        </p>
        <Link
          href={`/news/${news.id}`}
          className="inline-flex px-5 py-2 rounded-full font-extrabold tracking-[0.1em] text-sm text-black transition-colors"
          style={{ backgroundColor: ACCENT }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#a88e72")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = ACCENT)}
        >
          READ MORE
        </Link>
      </div>
    </div>
  );
}
