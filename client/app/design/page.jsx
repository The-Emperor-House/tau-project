"use client";

import Image from "next/image";
import Link from "next/link";
import { Box, Typography } from "@mui/material";

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
    <Box
      component={Link}
      href={t.link}
      sx={{
        display: "block",
        width: "100%",
        textDecoration: "none",
        color: "inherit",
        bgcolor: "#ffffff",
        borderRadius: 1,
        boxShadow: "0 6px 24px rgba(0,0,0,.18)",
      }}
    >
      {/* กรอบขาวรอบรูป */}
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Box sx={{ position: "relative", width: "100%", overflow: "hidden" }}>
          <Box sx={{ pt: { xs: "60%", md: "58%" } }} />
          <Image
            src={t.image}
            alt={t.title}
            fill
            sizes="(max-width: 1200px) 100vw, 600px"
            style={{ objectFit: "cover" }}
            priority
          />
        </Box>
      </Box>

      {/* แถบชื่อด้านล่าง */}
      <Box
        sx={{
          px: { xs: 2.5, md: 4 },
          py: { xs: 3, md: 4 },
          bgcolor: "#ffffff",
        }}
      >
        <Typography
          component="h3"
          sx={{
            textAlign: "center",
            fontWeight: 300,
            letterSpacing: { xs: ".18em", md: ".28em" },
            fontSize: { xs: "1.1rem", md: "2rem" },
            lineHeight: 1.2,
          }}
        >
          {t.title}
        </Typography>
      </Box>
    </Box>
  );
}

export default function DesignPage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#404040",
        display: "flex",
        flexDirection: "column",
        gap: { xs: 4, md: 6 },
        pt: { xs: "120px", md: "160px" },
      }}
    >
      {/* หัว DESIGN ชิดขวา */}
      <Box
        sx={{
          width: "100%",
          maxWidth: "1400px",
          mx: "auto",
          px: { xs: 2, md: 4 },
          textAlign: "right",
        }}
      >
        <Typography
          component="h1"
          sx={{
            color: "#fff",
            fontWeight: 300,
            letterSpacing: { xs: ".4em", md: ".6em" },
            fontSize: { xs: "1.6rem", md: "3rem" },
          }}
        >
          DESIGN
        </Typography>
      </Box>

      {/* การ์ด 2 ใบ */}
      <Box
        sx={{
          width: "100%",
          maxWidth: "1400px",
          mx: "auto",
          px: { xs: 2, md: 4 },
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: { xs: 3, md: 4 },
        }}
      >
        {tiles.map((t) => (
          <DesignTile key={t.id} t={t} />
        ))}
      </Box>

      <Box sx={{ height: { xs: 24, md: 40 } }} />
    </Box>
  );
}
