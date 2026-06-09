"use client";
import React, { useState, memo } from "react";
import Image from "next/image";
import { Box } from "@mui/material";

const MapEmbed = memo(function MapEmbed() {
  const [loaded, setLoaded] = useState(false);
  const SRC =
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d968.2917269963981!2d100.60474666961754!3d13.888966199157336!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e282bda8af42d7%3A0xcf30461c6ca7347e!2z4LiU4Li0IOC5gOC4reC5h-C4oeC5gOC4nuC4reC5gOC4o-C5iOC4reC4o-C5jCDguYDguK7guYnguLLguKrguYwgVGhlIEVtcGVyb3IgSG91c2UgQ28uLEx0ZA!5e0!3m2!1sth!2sth!4v1755498037743!5m2!1sth!2sth";

  return (
    <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          bgcolor: "grey.300",
          opacity: loaded ? 0 : 1,
          transition: "opacity 300ms ease",
          pointerEvents: "none",
        }}
      />
      <Box
        component="iframe"
        title="The Emperor House Co., Ltd. (Map)"
        src={SRC}
        loading="eager"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        onLoad={() => setLoaded(true)}
        sx={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          border: 0,
          opacity: loaded ? 1 : 0,
          transition: "opacity 300ms ease",
          backfaceVisibility: "hidden",
          transform: "translateZ(0)",
          willChange: "opacity",
        }}
      />
    </Box>
  );
});

export default function MapCards() {
  return (
    <div
      className="
      grid w-full my-0
      h-screen
      grid-rows-[1fr_1fr]
      lg:h-screen lg:grid-rows-1 lg:grid-cols-[4fr_6fr]
      "
    >
      {/* ซ้าย: รูปทีม (mobile = บน) */}
      <div className="relative min-h-[45vh] md:min-h-0 md:h-full">
        <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
          <Image
            src="/home/team/104096.webp"
            alt="Taurus Team"
            fill
            sizes="(max-width: 768px) 100vw, (min-width: 769px) 50vw"
            className="object-cover object-center"
            priority
          />
        </Box>
      </div>

      {/* ขวา: Google Map (mobile = ล่าง) */}
      <div className="relative min-h-[45vh] md:min-h-0 md:h-full">
        <MapEmbed />
      </div>
    </div>
  );
}
