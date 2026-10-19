"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Lightbox from "@/shared/components/site/Lightbox";
import { furnitureTypeLabel, formatPrice } from "../furnitureFormat";
import { photoCount } from "@/shared/lib/image";

const skeleton = "bg-white/[0.06] animate-pulse";

// initialItem มาจาก server (page.jsx) — ถ้าเป็น null แปลว่า server ดึงไม่สำเร็จ ให้ดึงเองฝั่ง client
export default function FurnitureDetailView({ id, initialItem = null }) {
  const [item, setItem] = useState(initialItem);
  const [loading, setLoading] = useState(initialItem == null);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    if (!id || initialItem != null) return;
    const ctrl = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/furniture/${id}`, { signal: ctrl.signal });
        setItem(res.ok ? await res.json() : null);
      } catch (e) {
        if (e.name === "AbortError") return;
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, [id, initialItem]);

  const gallery = useMemo(
    () => [item?.coverUrl, ...(item?.images?.map((im) => im.imageUrl) || [])].filter(Boolean),
    [item]
  );
  const coverOffset = item?.coverUrl ? 1 : 0;

  const specs = [
    ["Width", item?.width],
    ["Depth", item?.depth],
    ["Height", item?.height],
  ].filter(([, v]) => typeof v === "number" && v > 0);

  return (
    <div className="bg-site-bg text-white min-h-screen pb-16 md:pb-24" style={{ paddingTop: "var(--page-top)" }}>
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        <Link
          href="/furniture"
          className="inline-flex items-center gap-2 mb-6 text-xs tracking-[0.2em] uppercase text-white/55 hover:text-site-accent transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Showroom
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10">
          {/* Cover image */}
          <div className="md:col-span-7">
            <button
              type="button"
              disabled={!gallery.length}
              onClick={() => setLightboxIndex(0)}
              aria-label="ดูรูปขนาดใหญ่"
              className="group relative block w-full aspect-video overflow-hidden bg-white/5 ring-1 ring-white/10 cursor-zoom-in"
            >
              {loading ? (
                <div className={`absolute inset-0 ${skeleton}`} />
              ) : item?.coverUrl ? (
                <Image
                  src={item.coverUrl}
                  alt={item.name || "furniture"}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 700px"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              ) : null}
            </button>
          </div>

          {/* Details */}
          <div className="md:col-span-5">
            {loading ? (
              <div className="space-y-3">
                <div className={`h-9 w-[70%] ${skeleton}`} />
                <div className={`h-5 w-[40%] ${skeleton}`} />
                <div className={`h-4 w-[90%] ${skeleton}`} />
                <div className={`h-4 w-[80%] ${skeleton}`} />
              </div>
            ) : !item ? (
              <p className="text-white/60">ไม่พบสินค้า</p>
            ) : (
              <>
                <p className="text-site-accent text-[11px] tracking-[0.3em] uppercase mb-3">{furnitureTypeLabel(item.type)}</p>
                <h1 className="text-[1.6rem] md:text-[2rem] font-normal leading-snug">{item.name}</h1>
                {formatPrice(item.price) && (
                  <p className="mt-3 text-site-accent text-xl font-light tracking-wide">{formatPrice(item.price)}</p>
                )}

                {specs.length > 0 && (
                  <dl className="mt-6 grid grid-cols-3 border-y border-white/10">
                    {specs.map(([label, value]) => (
                      <div key={label} className="py-3.5 text-center border-r last:border-r-0 border-white/10">
                        <dt className="text-[10px] tracking-[0.25em] uppercase text-white/45">{label}</dt>
                        <dd className="mt-1 text-white/90">{value} cm</dd>
                      </div>
                    ))}
                  </dl>
                )}

                {item.details && (
                  <p className="mt-6 text-white/75 whitespace-pre-wrap leading-[1.9]">{item.details}</p>
                )}

                <Link
                  href="/contact"
                  className="mt-8 inline-flex items-center justify-center px-8 py-3 text-sm border border-site-accent/60 text-site-accent hover:bg-site-accent hover:text-black transition-colors"
                >
                  สอบถามสินค้า
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Gallery */}
        {!loading && item?.images?.length > 0 && (
          <section className="mt-12 md:mt-16">
            <div className="flex items-baseline justify-between mb-5 pb-3 border-b border-white/10">
              <h2 className="text-xs tracking-[0.3em] uppercase text-white/70">Gallery</h2>
              <span className="text-xs tracking-[0.2em] text-white/40">{photoCount(item.images.length)}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {item.images.map((img, i) => (
                <button
                  key={img?.id ?? i}
                  type="button"
                  onClick={() => setLightboxIndex(coverOffset + i)}
                  aria-label={`ดูรูปที่ ${i + 1}`}
                  className="group relative aspect-square overflow-hidden bg-white/5 ring-1 ring-white/10 hover:ring-site-accent/50 cursor-zoom-in transition"
                >
                  <Image
                    src={img.imageUrl}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 300px"
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
        title={item?.name}
      />
    </div>
  );
}
