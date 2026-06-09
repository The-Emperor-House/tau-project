"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Box } from "@mui/material";

export default function LogoSwap({
  href = "/",
  lightSrc = "/logo/LOGO NEW TAURUS WHITE.png",
  accentSrc = "/logo/LOGO NEW TAURUS ORANGE.png",
  width = 160,
  height = 60,
  showOnXs = true,
}) {
  const [hover, setHover] = useState(false);

  useEffect(() => {
    const img = new window.Image();
    img.decoding = "async";
    img.loading = "eager";
    img.src = accentSrc;
  }, [accentSrc]);

  return (
    <Box
      component={Link}
      href={href}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      sx={{
        position: "relative",
        display: showOnXs ? "flex" : { xs: "none", md: "flex" },
        alignItems: "center",
        textDecoration: "none",
        width,
        height,
      }}
    >
      <Box sx={{ position: "relative", width, height }}>
        <Image
          src={lightSrc}
          alt="Taurus Logo"
          width={width}
          height={height}
          priority
          draggable={false}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
            transition: "opacity .25s ease",
            opacity: hover ? 0 : 1,
          }}
        />

        <Image
          src={accentSrc}
          alt=""
          aria-hidden
          width={width}
          height={height}
          draggable={false}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
            transition: "opacity .25s ease",
            opacity: hover ? 1 : 0,
          }}
        />
      </Box>
    </Box>
  );
}
