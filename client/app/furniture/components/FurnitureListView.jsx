"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import InfoCard, { InfoCardSkeleton } from "@/shared/components/site/InfoCard";
import Pagination from "@/shared/components/site/Pagination";
import { paginate, buildQuery } from "@/shared/lib/pagination";
import { FURNITURE_TYPES, formatDimensions, formatPrice } from "../furnitureFormat";

const PAGE_SIZE = 12;
const TABS = [{ value: "ALL", label: "All" }, ...FURNITURE_TYPES];

const hrefFor = (type, page) =>
  `/furniture${buildQuery({ type: type === "ALL" ? undefined : type, page })}`;

// initialItems (ทุกประเภท) มาจาก server — ถ้าเป็น null ให้ดึงเองฝั่ง client
// type/page มาจาก URL (?type=LOOSE&page=2) — กดเข้าสินค้าแล้วกด back จะกลับมาแท็บ/หน้าเดิม
// การกรองตามประเภททำในหน้าเลย ไม่ต้องยิง API ใหม่ทุกครั้งที่กดแท็บ
export default function FurnitureListView({ initialItems = null, type: requestedType, page: requestedPage = 1 }) {
  const [allItems, setAllItems] = useState(() => (Array.isArray(initialItems) ? initialItems : []));
  const [loading, setLoading] = useState(initialItems == null);
  const type = TABS.some((t) => t.value === requestedType) ? requestedType : "ALL";

  useEffect(() => {
    if (initialItems != null) return;
    const ctrl = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/furniture`, { signal: ctrl.signal });
        const data = res.ok ? await res.json() : [];
        setAllItems(Array.isArray(data) ? data : []);
      } catch (e) {
        if (e.name !== "AbortError") setAllItems([]);
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, [initialItems]);

  const items = useMemo(
    () => (type === "ALL" ? allItems : allItems.filter((it) => it.type === type)),
    [allItems, type]
  );
  const { page, totalPages, pageItems } = paginate(items, requestedPage, PAGE_SIZE);

  return (
    <div className="bg-site-bg text-white min-h-screen pb-16 md:pb-24" style={{ paddingTop: "var(--page-top)" }}>
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 md:gap-8 mb-6 md:mb-8">
          <span className="h-px bg-gradient-to-r from-transparent to-white/25" />
          <h1 className="text-center font-extralight tracking-[0.2em] md:tracking-[0.3em] text-[1.6rem] md:text-[2.2rem] uppercase leading-none">
            Furniture
          </h1>
          <span className="h-px bg-gradient-to-l from-transparent to-white/25" />
        </div>

        {/* Filter */}
        <div className="flex justify-center mb-10">
          <nav aria-label="Furniture type" className="flex border border-white/20 overflow-x-auto max-w-full">
            {TABS.map((t) => {
              const active = type === t.value;
              return (
                <Link
                  key={t.value}
                  href={hrefFor(t.value, 1)}
                  scroll={false}
                  aria-current={active ? "page" : undefined}
                  className={`px-5 md:px-6 py-2.5 text-xs tracking-[0.2em] uppercase whitespace-nowrap transition-colors border-r last:border-r-0 border-white/20 ${
                    active ? "bg-site-accent text-black" : "text-white/80 hover:bg-site-accent/15 hover:text-white"
                  }`}
                >
                  {t.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 items-stretch">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <InfoCardSkeleton key={i} aspect="16 / 9" />)
            : items.length === 0
            ? (
                <p className="col-span-full py-24 text-center text-white/50 text-sm tracking-[0.15em]">ไม่พบสินค้า</p>
              )
            : pageItems.map((it, i) => {
                const dims = formatDimensions(it);
                const price = formatPrice(it.price);
                return (
                  <InfoCard
                    key={it.id}
                    href={`/furniture/${it.id}`}
                    image={it.coverUrl || it.images?.[0]?.imageUrl}
                    alt={it.name}
                    aspect="16 / 9"
                    align="left"
                    priority={i < 3}
                  >
                    <h2 className="text-white text-[1.05rem] font-medium leading-snug">{it.name}</h2>
                    {it.details && (
                      <p className="mt-1.5 text-white/60 text-[0.92rem] leading-relaxed line-clamp-2">{it.details}</p>
                    )}
                    {(dims || price) && (
                      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 mt-3 pt-3 border-t border-white/10">
                        {dims && <p className="text-white/55 text-[0.85rem]">{dims}</p>}
                        {price && <p className="text-site-accent text-[0.95rem]">{price}</p>}
                      </div>
                    )}
                  </InfoCard>
                );
              })}
        </div>

        {!loading && (
          <Pagination page={page} totalPages={totalPages} hrefFor={(p) => hrefFor(type, p)} />
        )}
      </div>
    </div>
  );
}
