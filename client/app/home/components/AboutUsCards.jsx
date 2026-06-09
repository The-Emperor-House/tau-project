"use client";

import React from "react";
import { Typography, Box } from "@mui/material";
import AboutUsSection from "@/app/about-us/components/AboutUsSection";

export default function AboutUsHomePageSection() {
  return (
    <Box component="section" sx={{ py: 12 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", lg: "row" },    
          justifyContent: { xs: "center", lg: "space-between" },
          alignItems: { xs: "center", lg: "center" },
          gap: { xs: 1.5, lg: 0 },
          mb: 4,
          px: { xs: 2, lg: 10 },
        }}
      >
        {/* ABOUT US */}
        <Typography
          variant="h3"
          sx={{
            fontWeight: 100,
            letterSpacing: "0.4rem",
            color: "text.primary",
            textAlign: { xs: "center", lg: "left" },          
          }}
        >
          ABOUT US
        </Typography>

        {/* RECRAFTING ... */}
        <Typography
          variant="body1"
          sx={{
            fontWeight: 800,
            color: "primary.main",
            letterSpacing: "0.25rem",
            textAlign: { xs: "center", lg: "right" },    
            // ไล่สเกลฟอนต์ให้โตขึ้นตามขนาดหน้าจอ
            fontSize: { xs: "1.25rem", sm: "1.35rem", md: "1.45rem", lg: "1.6rem" },
            lineHeight: 1.2,
            pr: { xs: 0, lg: 40 },
          }}
        >
          RECRAFTING SPACES. REVIVING LIVING.
        </Typography>
      </Box>

      <AboutUsSection />
    </Box>
  );
}
