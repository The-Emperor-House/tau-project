"use client";

import Image from "next/image";
import Link from "next/link";

const tiles = [
  {
    id: "architectural",
    title: "ARCHITECTURAL DESIGN",
    image: "/design/architectural-cover.webp",
    link: "/design/architectural",
  },
  {
    id: "interior",
    title: "INTERIOR DESIGN",
    image: "/design/interior-cover.webp",
    link: "/design/interior",
  },
];

function DesignTile({ t }) {
  return (
    <Link
      href={t.link}
      className="block w-full no-underline text-inherit bg-white rounded shadow-[0_6px_24px_rgba(0,0,0,0.18)] hover:shadow-[0_10px_32px_rgba(0,0,0,0.28)] transition-shadow"
    >
      <div className="p-4 md:p-6">
        <div className="relative w-full overflow-hidden" style={{ paddingTop: "58%" }}>
          <Image
            src={t.image}
            alt={t.title}
            fill
            sizes="(max-width: 1200px) 100vw, 600px"
            className="object-cover"
            priority
          />
        </div>
      </div>

      <div className="px-6 md:px-10 py-6 md:py-8 bg-white">
        <h3 className="text-center font-light tracking-[0.18em] md:tracking-[0.28em] text-[1.1rem] md:text-[2rem] leading-tight">
          {t.title}
        </h3>
      </div>
    </Link>
  );
}

export default function DesignPage() {
  return (
    <div
      className="min-h-screen bg-[#404040] flex flex-col gap-8 md:gap-12"
      style={{ paddingTop: "var(--page-top)" }}
    >
      <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 text-right">
        <h1 className="text-white font-light tracking-[0.4em] md:tracking-[0.6em] text-[1.6rem] md:text-[3rem]">
          DESIGN
        </h1>
      </div>

      <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {tiles.map((t) => (
          <DesignTile key={t.id} t={t} />
        ))}
      </div>

      <div className="h-6 md:h-10" />
    </div>
  );
}
