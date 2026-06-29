"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Skeleton } from "@/shared/components/ui/skeleton";
import MediaEmbed from "@/shared/components/ui/MediaEmbed";

const ACCENT = "#BFA68A";
const FRAME = "#333";
const FALLBACK_COVER = "/images/default-news.jpg";

function resolveUrl(u) {
  if (!u) return null;
  if (u.startsWith("https://")) return u;
  if (u.startsWith("//")) return "https:" + u;
  if (u.startsWith("http://")) return u.replace(/^http:\/\//i, "https://");
  if (u.startsWith("/")) {
    const base = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");
    return base ? `${base}${u}` : u;
  }
  return u;
}
function extractLabel(h1 = "") {
  const s = String(h1).trim();
  if (!s) return "NEWS :";
  if (s.includes(":")) return `${s.split(":")[0].trim().toUpperCase()} :`;
  return `${s.split(/\s+/)[0].toUpperCase()} :`;
}
function dateLine(d) {
  if (!d) return "";
  return new Date(d)
    .toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    .toUpperCase();
}

export default function LatestNews({ title = "News & Events", showViewAll = true }) {
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setErr("");
        let res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/news?limit=1`, { signal: ctrl.signal });
        let latest = null;
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length) latest = data[0];
        }
        if (!latest) {
          const rAll = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/news`, { signal: ctrl.signal });
          const all = rAll.ok ? await rAll.json() : [];
          if (Array.isArray(all) && all.length) {
            latest = [...all].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
          }
        }
        setNews(latest || null);
      } catch (e) {
        if (e.name !== "AbortError") setErr(e.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, []);

  const cover = useMemo(() => resolveUrl(news?.coverUrl) || FALLBACK_COVER, [news?.coverUrl]);

  if (err) {
    return (
      <div className="bg-white px-4 md:px-6 py-12 md:py-16">
        <div className="px-4 py-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">{err}</div>
      </div>
    );
  }

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

      {/* Content */}
      {loading || !news ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8">
          <div className="md:col-span-7">
            <div style={{ border: `10px solid ${FRAME}`, borderRadius: 4 }}>
              <div className="relative aspect-video bg-neutral-100">
                <Skeleton className="absolute inset-0 w-full h-full" />
              </div>
            </div>
          </div>
          <div className="md:col-span-5 space-y-2">
            <Skeleton className="h-6 w-3/5" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="h-10 w-36 mt-2" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-start">
          <div className="md:col-span-7">
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
          </div>

          <div className="md:col-span-5">
            <p className="font-extrabold text-[1rem] md:text-[1.1rem] mb-2">{dateLine(news.createdAt)}</p>
            <p className="font-extrabold tracking-[0.06em] uppercase mb-1" style={{ color: ACCENT }}>
              {extractLabel(news.heading1)}
            </p>
            <p className="font-black text-[1.2rem] md:text-[1.4rem] leading-tight mb-3">
              {news.heading2 || news.heading1}
            </p>
            {news.body && (
              <p className="text-muted-foreground leading-relaxed mb-4">
                {news.body.length > 140 ? news.body.slice(0, 140) + "…" : news.body}
              </p>
            )}
            <div className="flex gap-3 flex-wrap">
              <Link
                href={`/news/${news.id}`}
                className="px-6 py-2.5 rounded-full font-extrabold tracking-[0.12em] text-black transition-colors"
                style={{ backgroundColor: ACCENT }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#a88e72")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = ACCENT)}
              >
                READ MORE
              </Link>
              {showViewAll && (
                <Link
                  href="/news"
                  className="px-6 py-2.5 rounded-full font-bold tracking-[0.12em] border transition-colors hover:bg-[#BFA68A]/10"
                  style={{ borderColor: ACCENT, color: ACCENT }}
                >
                  VIEW ALL
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
