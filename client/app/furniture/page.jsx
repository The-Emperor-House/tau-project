"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/shared/components/ui/skeleton";
import FurnitureCard from "./components/FurnitureCard";

const ACCENT = "#BFA68A";
const TYPES = ["ALL", "BUILT_IN", "LOOSE", "CUSTOM"];
const TYPE_LABELS = { ALL: "ALL", BUILT_IN: "BUILT-IN", LOOSE: "LOOSE", CUSTOM: "CUSTOM" };

export default function FurnitureListPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("ALL");

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const q = type !== "ALL" ? `?type=${type}` : "";
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/furniture${q}`,
          { signal: ctrl.signal }
        );
        const data = res.ok ? await res.json() : [];
        setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        if (e.name !== "AbortError") setItems([]);
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, [type]);

  return (
    <div
      className="bg-[#404040] text-white min-h-screen pb-16"
      style={{ paddingTop: "var(--page-top)" }}
    >
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 mb-6">
          <div />
          <p className="text-center font-extralight tracking-[0.12em] md:tracking-[0.16em] text-[1.6rem] md:text-[2.2rem] uppercase leading-none">
            Furniture
          </p>
          <div />
        </div>

        {/* Filter */}
        <div className="flex justify-center mb-8">
          <div className="flex border border-white/20 rounded overflow-hidden">
            {TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className="px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: type === t ? ACCENT : "transparent",
                  color: type === t ? "#111" : "#fff",
                  borderRight: t !== "CUSTOM" ? "1px solid rgba(255,255,255,0.2)" : undefined,
                }}
                onMouseEnter={(e) => {
                  if (type !== t) e.currentTarget.style.backgroundColor = "rgba(191,166,138,0.15)";
                }}
                onMouseLeave={(e) => {
                  if (type !== t) e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                {TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="w-full aspect-video mb-3 bg-white/10" />
                  <Skeleton className="h-6 w-[80%] bg-white/10" />
                  <Skeleton className="h-5 w-[60%] mt-1.5 bg-white/10" />
                </div>
              ))
            : items.map((it) => (
                <FurnitureCard
                  key={it.id}
                  item={it}
                  onClick={() => router.push(`/furniture/${it.id}`)}
                />
              ))}
        </div>
      </div>
    </div>
  );
}
