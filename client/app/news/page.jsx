"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Skeleton } from "@/shared/components/ui/skeleton";
import MediaEmbed from "@/shared/components/ui/MediaEmbed";

const ACCENT = "#BFA68A";
const FRAME = "#333";
const FALLBACK_COVER = "/images/default-news.jpg";
const PAGE_SIZE = 5;

const resolveUrl = (u) => {
  if (!u) return null;
  if (u.startsWith("https://")) return u;
  if (u.startsWith("//")) return "https:" + u;
  if (u.startsWith("http://")) return u.replace(/^http:\/\//i, "https://");
  if (u.startsWith("/")) {
    const base = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");
    return base ? `${base}${u}` : u;
  }
  return u;
};
const dateLine = (d) =>
  d
    ? new Date(d)
        .toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
        .toUpperCase()
    : "";
const extractLabel = (h1 = "") => {
  const s = String(h1).trim();
  if (!s) return "NEWS :";
  if (s.includes(":")) return `${s.split(":")[0].trim().toUpperCase()} :`;
  return `${s.split(/\s+/)[0].toUpperCase()} :`;
};

export default function NewsListPage() {
  const [allItems, setAllItems] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/news`, {
          signal: ctrl.signal,
        });
        const data = res.ok ? await res.json() : [];
        const sorted = Array.isArray(data)
          ? [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          : [];
        setAllItems(sorted);
      } catch (e) {
        if (e.name !== "AbortError") setErr(e.message || "โหลดข้อมูลไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, []);

  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return allItems.slice(start, start + PAGE_SIZE);
  }, [allItems, page]);

  const totalPages = Math.max(1, Math.ceil(allItems.length / PAGE_SIZE));
  const canNext = page < totalPages;

  return (
    <div
      className="bg-[#404040] text-white min-h-screen flex flex-col"
      style={{ paddingTop: "var(--page-top)" }}
    >
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 pb-16 flex-1 w-full">
        {/* Header */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 mb-8">
          <div className="h-px bg-black" />
          <p className="font-black tracking-[0.12em] text-[1.6rem] md:text-[2.4rem] uppercase text-center">
            News &amp; Events
          </p>
          <div className="h-px bg-black" />
        </div>

        {err && (
          <div className="mb-4 px-4 py-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg">
            {err}
          </div>
        )}

        {/* Items */}
        {loading && allItems.length === 0
          ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div key={i} className="mb-8">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8">
                  <div className="md:col-span-7">
                    <div style={{ border: `10px solid ${FRAME}`, borderRadius: 4 }}>
                      <div className="relative aspect-video bg-neutral-900">
                        <Skeleton className="absolute inset-0 w-full h-full" />
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-5 space-y-2">
                    <Skeleton className="h-8 w-[70%]" />
                    <Skeleton className="h-5 w-[35%]" />
                    <Skeleton className="h-4 w-[80%]" />
                    <Skeleton className="h-4 w-[65%]" />
                    <Skeleton className="h-4 w-[50%]" />
                    <Skeleton className="h-10 w-40 mt-2" />
                  </div>
                </div>
              </div>
            ))
          : pageItems.map((it) => {
              const cover = resolveUrl(it.coverUrl) || FALLBACK_COVER;
              return (
                <div key={it.id} className="mb-10">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-start">
                    {/* Media */}
                    <div className="md:col-span-7">
                      <div style={{ border: `10px solid ${FRAME}`, borderRadius: 4 }}>
                        <div className="relative aspect-video overflow-hidden bg-neutral-900">
                          {it.videoUrl ? (
                            <MediaEmbed url={it.videoUrl} />
                          ) : (
                            <img
                              src={cover}
                              alt={it.heading1 || "news cover"}
                              onError={(e) => (e.currentTarget.src = FALLBACK_COVER)}
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Text */}
                    <div className="md:col-span-5">
                      <p className="font-extrabold text-[1rem] md:text-[1.1rem] mb-2 truncate">
                        {dateLine(it.createdAt)}
                      </p>
                      <p
                        className="font-extrabold tracking-[0.06em] uppercase mb-1 truncate"
                        style={{ color: ACCENT }}
                      >
                        {extractLabel(it.heading1)}
                      </p>
                      <p className="font-black text-[1.2rem] md:text-[1.4rem] leading-tight mb-3 line-clamp-2">
                        {it.heading2 || it.heading1}
                      </p>
                      {it.body && (
                        <p className="text-white/85 leading-relaxed mb-4 line-clamp-3">
                          {it.body}
                        </p>
                      )}
                      <Link
                        href={`/news/${it.id}`}
                        className="inline-flex items-center px-6 py-3 rounded-full font-extrabold tracking-[0.12em] text-black transition-colors"
                        style={{ backgroundColor: ACCENT }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#a88e72")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = ACCENT)}
                      >
                        READ MORE
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}

        {/* Pagination */}
        <div className="flex justify-end mt-8 gap-4">
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={!canNext || loading}
            className="px-8 py-3.5 rounded-full font-extrabold tracking-[0.18em] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              backgroundColor: canNext ? ACCENT : "rgba(255,255,255,.2)",
              color: canNext ? "#000" : "rgba(255,255,255,.6)",
            }}
          >
            Next →
          </button>
        </div>

        <hr className="mt-12 border-white/12" />
      </div>
    </div>
  );
}
