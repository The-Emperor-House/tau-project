"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import BackgroundImage from "../hero/BackgroundImage";
import "swiper/css";
import "swiper/css/autoplay";

export default function Carousel({
  slides = [],
  height = "100vh",
  delay = 5000,
}) {
  if (!slides.length) {
    return (
      <div className="grid place-items-center w-full bg-black text-white" style={{ height: "80vh" }}>
        No slides
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden bg-black" style={{ height }}>
      <Swiper
        modules={[Autoplay]}
        slidesPerView={1}
        loop
        speed={700}
        autoplay={{ delay, disableOnInteraction: false }}
        style={{ width: "100%", height: "100%" }}
      >
        {slides.map((s) => (
          <SwiperSlide key={s.id} style={{ position: "relative" }}>
            <BackgroundImage
              src={s.imageSrc}
              alt={s.alt || `slide-${s.id}`}
              dim={s.dim}
              gradient={s.gradient}
              priority={s.priority}
              objectPosition={s.objectPosition}
            />
            <div className="absolute inset-0 z-[2] flex items-center justify-center">
              {s.content}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
