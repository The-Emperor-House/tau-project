"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Skeleton } from "@/shared/components/ui/skeleton";
import MediaEmbed from "@/shared/components/ui/MediaEmbed";

const FALLBACK_COVER = "/images/default-news.jpg";
const ACCENT = "#cc8f2a";

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

function formatDateLine(d) {
  const dt = new Date(d);
  const day = dt.getDate();
  const month = dt.toLocaleString("en-US", { month: "long" }).toUpperCase();
  const year = dt.getFullYear();
  return `${day} ${month} ${year}`;
}

export default function NewsDetail() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [item, setItem] = useState(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

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
        <p className="text-center font-extrabold tracking-[0.08em] text-[1.2rem] md:text-[1.8rem] uppercase mb-6 md:mb-8 truncate">
          {loading ? <Skeleton className="w-64 h-8 mx-auto" /> : dateLine}
        </p>

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
                  loading="eager"
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
                    className="relative w-full aspect-square overflow-hidden rounded bg-neutral-900"
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
    </div>
  );
}
