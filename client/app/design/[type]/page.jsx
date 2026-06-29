"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/shared/components/ui/skeleton";
import DesignGalleryModal from "../components/DesignGalleryModal";

export default function DesignTypePage() {
  const { type } = useParams();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const sidebarLabel = type ? `${String(type).toUpperCase()} DESIGN` : "DESIGN";

  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/designs?type=${String(type).toUpperCase()}`
        );
        const data = await res.json();
        if (!alive) return;
        if (Array.isArray(data)) setItems(data);
        else if (data && Array.isArray(data.data)) setItems(data.data);
        else setItems([]);
      } catch {
        if (alive) setItems([]);
      } finally {
        if (alive) setLoading(false);
      }
    };
    if (type) load();
    else {
      setItems([]);
      setLoading(false);
    }
    return () => { alive = false; };
  }, [type]);

  return (
    <div
      className="bg-[#404040] text-white min-h-screen pb-16 md:pb-20"
      style={{ paddingTop: "var(--page-top)" }}
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 flex gap-6 xl:gap-10">
        {/* Grid */}
        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-stretch">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i}>
                    <Skeleton className="w-full h-[220px] md:h-[260px] bg-white/10" />
                    <Skeleton className="w-[70%] h-7 mt-3 mx-auto bg-white/10" />
                  </div>
                ))
              : items.map((it) => (
                  <div key={it.id} className="flex flex-col gap-3">
                    <MiniCarouselCell item={it} onClick={() => setSelected(it)} />
                    <p className="text-center text-[1.05rem] md:text-[1.25rem] tracking-[0.18em] font-light opacity-95">
                      {it.title || it.name || "Perspective 3 D"}
                    </p>
                  </div>
                ))}
          </div>
        </div>

        {/* Vertical label — lg+ only */}
        <div className="hidden lg:flex w-[50px] sticky self-start items-center justify-center px-3"
          style={{ top: "120px", height: "calc(100vh - 120px)" }}>
          <p
            className="text-white/95 font-light text-[2.6rem] xl:text-[3rem] tracking-[0.35em] leading-none select-none text-center px-3 py-2"
            style={{ writingMode: "vertical-rl", textOrientation: "mixed", textTransform: "uppercase" }}
          >
            {sidebarLabel}
          </p>
        </div>
      </div>

      {selected && (
        <DesignGalleryModal
          open={Boolean(selected)}
          onClose={() => setSelected(null)}
          design={selected}
        />
      )}
    </div>
  );
}

function MiniCarouselCell({ item, onClick }) {
  const FALLBACK = "/images/default-data.jpg";

  const pics = useMemo(() => {
    const arr = [];
    if (item?.coverUrl) arr.push(item.coverUrl);
    if (Array.isArray(item?.images)) {
      for (const im of item.images) if (im?.imageUrl) arr.push(im.imageUrl);
    }
    return arr.length ? arr : [FALLBACK];
  }, [item]);

  const [idx, setIdx] = useState(0);
  const prev = (e) => {
    e.stopPropagation();
    setIdx((i) => (i - 1 + pics.length) % pics.length);
  };
  const next = (e) => {
    e.stopPropagation();
    setIdx((i) => (i + 1) % pics.length);
  };

  return (
    <div
      onClick={onClick}
      className="relative w-full overflow-hidden bg-neutral-900 cursor-pointer"
      style={{ paddingTop: "56.25%" }}
    >
      <img
        src={pics[idx]}
        alt={item?.name || "design"}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover block"
        onError={(e) => (e.currentTarget.src = FALLBACK)}
      />

      {pics.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-1.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center bg-black/55 text-white hover:bg-black/75 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center bg-black/55 text-white hover:bg-black/75 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}
    </div>
  );
}
