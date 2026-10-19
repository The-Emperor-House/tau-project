"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Lightbox from "@/shared/components/site/Lightbox";
import { canOptimize } from "@/shared/lib/image";
import { hasThai } from "@/shared/lib/utils";
import Pagination from "@/shared/components/site/Pagination";
import { paginate, buildQuery } from "@/shared/lib/pagination";
import { findDesignType } from "../designTypes";

const PAGE_SIZE = 9;

const galleryOf = (item) =>
  [item?.coverUrl, ...(item?.images?.map((img) => img.imageUrl) || [])].filter(Boolean);

// initialItems มาจาก server (page.jsx) — ถ้าเป็น null แปลว่า server ดึงไม่สำเร็จ ให้ดึงเองฝั่ง client
// page มาจาก ?page= ใน URL
export default function DesignTypeView({ type, initialItems = null, page: requestedPage = 1 }) {
  const [items, setItems] = useState(() => (Array.isArray(initialItems) ? initialItems : []));
  const [loading, setLoading] = useState(initialItems == null);
  const [selected, setSelected] = useState(null);

  const sidebarLabel = findDesignType(type)?.title ?? "Design";
  const { page, totalPages, pageItems } = paginate(items, requestedPage, PAGE_SIZE);

  useEffect(() => {
    if (initialItems != null) return;
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/designs?type=${String(type).toUpperCase()}`);
        const data = res.ok ? await res.json() : [];
        if (alive) setItems(Array.isArray(data) ? data : []);
      } catch {
        if (alive) setItems([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [type, initialItems]);

  return (
    <div className="bg-site-bg text-white min-h-screen pb-16 md:pb-20" style={{ paddingTop: "var(--page-top)" }}>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 flex gap-6 xl:gap-10">
        {/* Grid */}
        <div className="flex-1 min-w-0">
          {/* หัวข้อบนมือถือ/แท็บเล็ต (จอใหญ่ใช้ป้ายแนวตั้งด้านขวา) */}
          <h1 className="lg:hidden mb-8 text-center font-light uppercase tracking-[0.3em] text-[1.4rem] sm:text-[1.8rem]">
            {sidebarLabel}
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10 md:gap-x-8 items-start">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} aria-hidden>
                    <div className="w-full aspect-video bg-white/[0.06] animate-pulse" />
                    <div className="w-[60%] h-5 mt-4 mx-auto bg-white/[0.06] animate-pulse" />
                  </div>
                ))
              : items.length === 0
              ? (
                  <p className="col-span-full py-24 text-center text-white/50 text-sm tracking-[0.15em]">
                    ยังไม่มีผลงานในหมวดนี้
                  </p>
                )
              : pageItems.map((it, i) => (
                  <div key={it.id} className="group flex flex-col">
                    <MiniCarouselCell item={it} priority={i < 3} onClick={() => setSelected(it)} />
                    <p className={`mt-4 text-center text-[1rem] md:text-[1.1rem] font-light text-white/90 transition-colors group-hover:text-site-accent ${hasThai(it.name) ? "" : "tracking-[0.12em]"}`}>
                      {it.name}
                    </p>
                    <span className="mx-auto mt-2 block h-px w-8 bg-site-accent/70 transition-all duration-500 group-hover:w-16" />
                  </div>
                ))}
          </div>

          {!loading && (
            <Pagination page={page} totalPages={totalPages} hrefFor={(p) => `/design/${type}${buildQuery({ page: p })}`} />
          )}
        </div>

        {/* Vertical label — lg+ only */}
        <div
          className="hidden lg:flex w-[50px] sticky self-start items-center justify-center"
          style={{ top: "120px", height: "calc(100vh - 160px)" }}
        >
          <span className="absolute top-0 bottom-0 left-1/2 w-px bg-gradient-to-b from-transparent via-white/15 to-transparent" />
          <p
            className="relative bg-site-bg py-4 text-white/90 font-light text-[2.4rem] xl:text-[2.8rem] tracking-[0.35em] leading-none select-none uppercase"
            style={{ writingMode: "vertical-rl" }}
          >
            {sidebarLabel}
          </p>
        </div>
      </div>

      <Lightbox
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        images={galleryOf(selected)}
        title={selected?.name}
      />
    </div>
  );
}

function MiniCarouselCell({ item, onClick, priority }) {
  const pics = useMemo(() => galleryOf(item), [item]);
  const [idx, setIdx] = useState(0);

  const step = (delta) => (e) => {
    e.stopPropagation();
    setIdx((i) => (i + delta + pics.length) % pics.length);
  };
  const arrow =
    "absolute top-1/2 -translate-y-1/2 w-9 h-9 grid place-items-center bg-black/45 text-white backdrop-blur-sm opacity-100 md:opacity-0 group-hover:opacity-100 hover:bg-black/70 transition";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick()}
      aria-label={`ดูรูป ${item?.name ?? ""}`}
      className="relative w-full aspect-video overflow-hidden bg-white/5 ring-1 ring-white/10 cursor-zoom-in transition-shadow duration-300 group-hover:ring-site-accent/50 group-hover:shadow-[0_18px_40px_-20px_rgba(0,0,0,0.7)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-site-accent"
    >
      {pics[idx] ? (
        <Image
          key={pics[idx]}
          src={pics[idx]}
          alt={item?.name || "design"}
          fill
          priority={priority && idx === 0}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
          unoptimized={!canOptimize(pics[idx])}
          className="object-cover animate-in fade-in-0 duration-300 transition-transform group-hover:scale-[1.04]"
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center text-[11px] tracking-[0.3em] text-white/30">NO IMAGE</div>
      )}

      {pics.length > 1 && (
        <>
          <button type="button" aria-label="previous" onClick={step(-1)} className={`${arrow} left-2`}>
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button type="button" aria-label="next" onClick={step(1)} className={`${arrow} right-2`}>
            <ChevronRight className="w-4 h-4" />
          </button>
          <span className="absolute bottom-2 right-2 bg-black/55 px-2 py-0.5 text-[10px] tracking-[0.15em] text-white/90">
            {idx + 1} / {pics.length}
          </span>
        </>
      )}
    </div>
  );
}
