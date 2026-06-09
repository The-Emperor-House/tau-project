"use client";

import { Box, Typography } from "@mui/material";
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
    <Box sx={{ position: "relative", height: { xs: "88vh", md: "100vh" } }}>
      {/* เลเยอร์ภาพสไลด์ */}
      <Carousel
        slides={slides}
        height={{ xs: "88vh", md: "100vh" }}
        delay={5000}
      />

      {/* เลเยอร์ข้อความ (คงที่ ไม่เลื่อนตามสไลด์) */}
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: { xs: "6%", sm: "8%", md: "10%" },
          transform: "translateY(-50%)",
          maxWidth: { xs: "90%", sm: "70%", md: "50%" },
          zIndex: 2,
        }}
      >
        <HeroText />
      </Box>

      {/* Tagline ล่างจอ */}
      <Box
        sx={{
          position: "absolute",
          bottom: { xs: 16, md: 24 },
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
          width: "100%",
          zIndex: 2,
          px: 2,
        }}
      >
        <Typography
          variant="body1"
          sx={{
            fontWeight: 300,
            fontSize: { xs: "1rem", sm: "1.3rem", md: "1.6rem" },
            opacity: 0.3,
            color: "#fff",
            textShadow: "0px 4px 12px rgba(0, 0, 0, 0.8)",
            letterSpacing: "0.05rem",
            whiteSpace: "nowrap",
          }}
        >
          RECRAFTING SPACES. REVIVING LIVING.
        </Typography>
      </Box>
    </Box>
  );
}
