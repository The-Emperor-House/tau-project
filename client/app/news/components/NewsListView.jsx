"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import MediaEmbed from "@/shared/components/ui/MediaEmbed";
import Pagination from "@/shared/components/site/Pagination";
import { paginate, buildQuery } from "@/shared/lib/pagination";
import { canOptimize } from "@/shared/lib/image";
import { resolveNewsUrl, newsLabel, formatNewsDate } from "@/shared/lib/news";
import { hasThai } from "@/shared/lib/utils";

const PAGE_SIZE = 5;
const skeleton = "bg-white/[0.06] animate-pulse";

const sortNews = (data) =>
  Array.isArray(data)
    ? [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    : [];

function NewsRow({ item, priority }) {
  const cover = resolveNewsUrl(item.coverUrl);
  return (
    <article className="group grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-10 items-start py-10 md:py-12 border-b border-white/10 first:pt-0">
      {/* Media */}
      <div className="md:col-span-7">
        {item.videoUrl ? (
          <MediaEmbed url={item.videoUrl} />
        ) : (
          <Link href={`/news/${item.id}`} className="relative block aspect-video overflow-hidden bg-white/5 ring-1 ring-white/10">
            {cover && (
              <Image
                src={cover}
                alt={item.heading1 || "news cover"}
                fill
                priority={priority}
                sizes="(max-width: 768px) 100vw, 680px"
                unoptimized={!canOptimize(cover)}
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
            )}
          </Link>
        )}
      </div>

      {/* Text */}
      <div className="md:col-span-5">
        <p className="text-white/50 text-xs tracking-[0.25em] uppercase mb-3">{formatNewsDate(item.createdAt)}</p>
        <p className={`text-site-accent uppercase mb-2 truncate ${hasThai(newsLabel(item.heading1)) ? "text-sm" : "text-[11px] tracking-[0.3em]"}`}>
          {newsLabel(item.heading1)}
        </p>
        <Link href={`/news/${item.id}`}>
          <h2 className="text-white text-[1.2rem] md:text-[1.4rem] leading-snug mb-3 line-clamp-2 transition-colors group-hover:text-site-accent">
            {item.heading2 || item.heading1}
          </h2>
        </Link>
        {item.body && <p className="text-white/65 leading-relaxed mb-6 line-clamp-3">{item.body}</p>}
        <Link
          href={`/news/${item.id}`}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-xs tracking-[0.25em] uppercase border border-site-accent/60 text-site-accent hover:bg-site-accent hover:text-black transition-colors"
        >
          Read more
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </article>
  );
}

// initialItems มาจาก server (page.jsx) — ถ้าเป็น null แปลว่า server ดึงไม่สำเร็จ ให้ดึงเองฝั่ง client
// page มาจาก ?page= ใน URL
export default function NewsListView({ initialItems = null, page: requestedPage = 1 }) {
  const [allItems, setAllItems] = useState(() => sortNews(initialItems));
  const [loading, setLoading] = useState(initialItems == null);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (initialItems != null) return;
    const ctrl = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/news`, { signal: ctrl.signal });
        const data = res.ok ? await res.json() : [];
        setAllItems(sortNews(data));
      } catch (e) {
        if (e.name !== "AbortError") setErr(e.message || "โหลดข้อมูลไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, [initialItems]);

  const { page, totalPages, pageItems } = paginate(allItems, requestedPage, PAGE_SIZE);

  return (
    <div className="bg-site-bg text-white min-h-screen flex flex-col" style={{ paddingTop: "var(--page-top)" }}>
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 pb-16 md:pb-24 flex-1 w-full">
        {/* Header */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 md:gap-8 mb-10 md:mb-14">
          <span className="h-px bg-gradient-to-r from-transparent to-white/25" />
          <h1 className="font-extralight tracking-[0.2em] md:tracking-[0.3em] text-[1.6rem] md:text-[2.4rem] uppercase text-center">
            News &amp; Events
          </h1>
          <span className="h-px bg-gradient-to-l from-transparent to-white/25" />
        </div>

        {err && (
          <div className="mb-6 px-4 py-3 text-sm text-red-300 bg-red-500/10 border border-red-500/20">{err}</div>
        )}

        {/* Items */}
        {loading && allItems.length === 0 ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} aria-hidden className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-10 py-10 border-b border-white/10 first:pt-0">
              <div className={`md:col-span-7 aspect-video ${skeleton}`} />
              <div className="md:col-span-5 space-y-3">
                <div className={`h-3 w-32 ${skeleton}`} />
                <div className={`h-7 w-[80%] ${skeleton}`} />
                <div className={`h-4 w-full ${skeleton}`} />
                <div className={`h-4 w-[70%] ${skeleton}`} />
                <div className={`h-10 w-40 mt-4 ${skeleton}`} />
              </div>
            </div>
          ))
        ) : pageItems.length === 0 ? (
          <p className="py-24 text-center text-white/50 text-sm tracking-[0.15em]">ยังไม่มีข่าวสาร</p>
        ) : (
          pageItems.map((it, i) => <NewsRow key={it.id} item={it} priority={page === 1 && i === 0} />)
        )}

        {!loading && (
          <Pagination page={page} totalPages={totalPages} hrefFor={(p) => `/news${buildQuery({ page: p })}`} className="mt-10" />
        )}
      </div>
    </div>
  );
}
