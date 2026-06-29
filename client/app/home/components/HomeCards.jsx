"use client";

import Carousel from "./home/carousel/Carousel";
import HeroText from "./home/hero/HeroText";

export default function HomeHero() {
  const files = ["01", "02", "03", "04", "05", "06"];

  const slides = files.map((n, i) => ({
    id: i + 1,
    imageSrc: `/home/swiper/${n}.webp`,
    dim: { xs: 0.34, md: 0.28, lg: 0.24 },
    gradient: false,
    priority: i === 0,
  }));

  return (
    <div className="relative h-[88vh] md:h-screen">
      <Carousel slides={slides} height="100%" delay={5000} />

      <div className="absolute top-1/2 left-[6%] sm:left-[8%] md:left-[10%] -translate-y-1/2 max-w-[90%] sm:max-w-[70%] md:max-w-1/2 z-[2]">
        <HeroText />
      </div>

      <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 text-center w-full z-[2] px-2">
        <p
          className="font-light text-white opacity-30 tracking-[0.05rem] text-center px-4"
          style={{ fontSize: "clamp(0.85rem, 2vw, 1.5rem)", textShadow: "0px 4px 12px rgba(0,0,0,0.8)" }}
        >
          RECRAFTING SPACES. REVIVING LIVING.
        </p>
      </div>
    </div>
  );
}
