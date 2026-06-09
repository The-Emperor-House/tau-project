"use client";

import { Typography, Box } from "@mui/material";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";

// ถ้ามี Sparkles ให้ปรับ path ให้ตรงโฟลเดอร์โปรเจกต์คุณ
const Sparkles = dynamic(
  () => import("@/shared/components/ui/Sparkles").then((m) => m.default),
  { ssr: false, loading: () => null }
);

// ---- Framer Variants ----
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};

const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut", delay },
  },
});

export default function HeroText() {
  return (
    <Box
      component={motion.div}
      variants={container}
      initial="hidden"
      animate="show"
      sx={{
        position: "relative", // ไว้ให้ Sparkles วาง absolute ด้านในได้
        pointerEvents: "none",
      }}
    >
      {/* เอฟเฟกต์ Sparkles (optional) */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          opacity: { xs: 0.25, md: 0.3 },
        }}
      >
        <Sparkles
          className=""
          minSize={0.5}
          maxSize={1.6}
          particleDensity={60}
          particleColor="#ffffff"
          speed={0.5}
        />
      </Box>

      {/* H1 */}
      <Box component={motion.div} variants={fadeUp(0)}>
        <Typography
          variant="h1"
          sx={{
            position: "relative",
            zIndex: 1,
            fontWeight: 600,
            fontSize: { xs: "3rem", sm: "4rem", md: "6rem" },
            color: "#cc8f2a",
            textShadow: "0px 4px 12px rgba(0, 0, 0, 0.8)",
            letterSpacing: { xs: "0.1rem", sm: "0.2rem", md: "1rem" },
            "@keyframes track": {
              from: { letterSpacing: "0.02em", opacity: 0.6 },
              to: { letterSpacing: "inherit", opacity: 1 },
            },
            animation: "track 900ms ease-out both",
          }}
        >
          TAURUS:
        </Typography>
      </Box>

      {/* H2 */}
      <Box component={motion.div} variants={fadeUp(0.06)}>
        <Typography
          variant="h2"
          sx={{
            position: "relative",
            zIndex: 1,
            fontWeight: 100,
            fontSize: { xs: "1.9rem", sm: "3rem", md: "3.5rem", lg: "5rem" },
            color: "#ffffff",
            textShadow: "0px 4px 12px rgba(0, 0, 0, 0.8)",
            letterSpacing: { xs: "0.1rem", sm: "0.2rem", md: "0.8rem" },
            mt: 1,
          }}
        >
          WE RENEW
        </Typography>
      </Box>

      {/* เส้น shimmer */}
      <Box component={motion.div} variants={fadeUp(0.12)}>
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: "2px",
            background:
              "linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,0.8), rgba(255,255,255,0))",
            mt: 1,
            overflow: "hidden",
            "&::after": {
              content: '""',
              position: "absolute",
              inset: 0,
              transform: "translateX(-100%)",
              background:
                "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.85) 50%, rgba(255,255,255,0) 100%)",
              "@keyframes shimmer": {
                "0%": { transform: "translateX(-100%)" },
                "100%": { transform: "translateX(100%)" },
              },
              animation: "shimmer 1800ms ease-in-out 500ms infinite",
            },
          }}
        />
      </Box>

      {/* แท็กไลน์ภาษาไทย (ตัดบรรทัดได้บนมือถือ) */}
      <Box component={motion.div} variants={fadeUp(0.18)}>
        <Typography
          variant="h3"
          sx={{
            position: "relative",
            zIndex: 1,
            fontWeight: 100,
            fontSize: { xs: "0.9rem", sm: "1.1rem", md: "1.2rem" },
            color: "#fdfdfd",
            textShadow: "0px 4px 12px rgba(0, 0, 0, 0.8)",
            letterSpacing: { xs: "0.1rem", sm: "0.2rem", md: "0.3rem" },
            mt: { xs: 1.5, sm: 2 },
            whiteSpace: { xs: "normal", md: "nowrap" },
          }}
        >
          "สร้างบ้านหลังใหม่ ในที่อยู่อาศัยเดิมของคุณ"
        </Typography>
      </Box>
    </Box>
  );
}
