"use client";

import { Box } from "@mui/material";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import BackgroundImage from "../hero/BackgroundImage";
import "swiper/css";
import "swiper/css/autoplay";

export default function Carousel({
  slides = [],
  overlayPaddingLeft = { xs: 24, md: 56 },
  height = "100vh",
  delay = 5000,
}) {
  if (!slides.length) {
    return (
      <Box sx={{ display: "grid", placeItems: "center", width: "100%", height: "80vh", bgcolor: "black", color: "common.white" }}>
        No slides
      </Box>
    );
  }

  return (
    <Box sx={{ position: "relative", width: "100%", height, bgcolor: "black", overflow: "hidden" }}>
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

            <Box
              sx={{
                position: "absolute",
                inset: 0,
                zIndex: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pl: overlayPaddingLeft,
              }}
            >
              {s.content}
            </Box>
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
} 