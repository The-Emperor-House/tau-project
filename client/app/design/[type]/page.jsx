"use client";

import { useEffect, useMemo, useState } from "react";
import { Box, Typography, Skeleton, IconButton } from "@mui/material";
import { useParams } from "next/navigation";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import ChevronRight from "@mui/icons-material/ChevronRight";

import DesignGalleryModal from "../components/DesignGalleryModal";

const COLORS = {
  bg: "#404040",
  text: "#fff",
  faint: "rgba(255,255,255,.10)",
  railText: "rgba(255,255,255,.95)",
};
const RAIL_WIDTH = 50;

export default function DesignTypePage() {
  const { type } = useParams();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const sidebarLabel = type ? `${String(type).toUpperCase()} DESIGN` : "DESIGN";

  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoading(true);
      try {
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/designs?type=${String(
          type
        ).toUpperCase()}`;
        const res = await fetch(apiUrl);
        const data = await res.json();
        if (!alive) return;
        if (Array.isArray(data)) setItems(data);
        else if (data && Array.isArray(data.data)) setItems(data.data);
        else setItems([]);
      } catch {
        if (alive) setItems([]);
      } finally {
        if (alive) setLoading(false);
      }
    };
    if (type) load();
    else {
      setItems([]);
      setLoading(false);
    }
    return () => {
      alive = false;
    };
  }, [type]);

  return (
    <Box sx={{ bgcolor: COLORS.bg, color: COLORS.text, minHeight: "100vh", pt: { xs: "120px", md: "160px" }, pb: { xs: 8, md: 10 } }}>
      <Box
        sx={{
          maxWidth: "1500px",
          mx: "auto",
          px: { xs: 2, sm: 3, md: 4 },
          display: "flex",
          gap: { lg: 3, xl: 5 },
        }}
      >

        {/* LEFT: ภาพ grid 3 คอลัมน์ */}
        <Box sx={{ flex: "1 1 auto", minWidth: 0 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                lg: "repeat(3, 1fr)",
              },
              gap: { xs: 2.5, md: 3.5 },
              alignItems: "stretch",
            }}
          >
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <Box key={i}>
                    <Skeleton
                      variant="rectangular"
                      sx={{ width: "100%", height: { xs: 220, md: 260 }, bgcolor: COLORS.faint }}
                    />
                    <Skeleton width="70%" height={28} sx={{ mt: 1.2, mx: "auto", bgcolor: COLORS.faint }} />
                  </Box>
                ))
              : items.map((it) => (
                  <Box key={it.id} sx={{ display: "flex", flexDirection: "column", gap: 1.2 }}>
                    <MiniCarouselCell item={it} onClick={() => setSelected(it)} />
                    <Typography
                      sx={{
                        textAlign: "center",
                        fontSize: { xs: "1.05rem", md: "1.25rem" },
                        letterSpacing: ".18em",
                        fontWeight: 300,
                        opacity: 0.95,
                      }}
                    >
                      {it.title || it.name || "Perspective 3 D"}
                    </Typography>
                  </Box>
                ))}
          </Box>
        </Box>

        {/* RIGHT: ป้ายชื่อแนวตั้ง sticky */}
        <Box
          sx={{
            width: { xs: 0, lg: RAIL_WIDTH },
            display: { xs: "none", lg: "block" },
            position: "sticky",
            top: { lg: "120px" },                         // ชดเชย navbar/pt ด้านบน
            alignSelf: "flex-start",
            height: { lg: "calc(100vh - 120px)" },        // สูงเท่าหน้าจอที่เหลือ
          }}
        >
          <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", px: 1.5 }}>
            <Typography
              sx={{
                writingMode: "vertical-rl",
                textAlign: "center",
                textOrientation: "mixed",
                textTransform: "uppercase",
                letterSpacing: ".35em",
                fontWeight: 300,
                fontSize: { lg: "2.6rem", xl: "3rem" },
                lineHeight: 1,
                color: COLORS.railText,
                px: 1.5,
                py: 1,
                userSelect: "none",
              }}
            >
              {sidebarLabel}
            </Typography>
          </Box>
        </Box>
      </Box>

      {selected && (
        <DesignGalleryModal
          open={Boolean(selected)}
          onClose={() => setSelected(null)}
          design={selected}
        />
      )}
    </Box>
  );
}

/* ----------------- Mini carousel สำหรับรูปแต่ละการ์ด ----------------- */
function MiniCarouselCell({ item, onClick }) {
  const FALLBACK = "/images/default-data.jpg";

  const pics = useMemo(() => {
    const arr = [];
    if (item?.coverUrl) arr.push(item.coverUrl);
    if (Array.isArray(item?.images)) {
      for (const im of item.images) if (im?.imageUrl) arr.push(im.imageUrl);
    }
    return arr.length ? arr : [FALLBACK];
  }, [item]);

  const [idx, setIdx] = useState(0);
  const prev = (e) => {
    e.stopPropagation();
    setIdx((i) => (i - 1 + pics.length) % pics.length);
  };
  const next = (e) => {
    e.stopPropagation();
    setIdx((i) => (i + 1) % pics.length);
  };

  return (
    <Box
      onClick={onClick}
      sx={{
        position: "relative",
        width: "100%",
        overflow: "hidden",
        bgcolor: "#111",
        cursor: "pointer",
      }}
    >
      {/* Aspect 16:9 */}
      <Box sx={{ pt: "56.25%" }} />
      <img
        src={pics[idx]}
        alt={item?.name || "design"}
        loading="lazy"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        onError={(e) => (e.currentTarget.src = FALLBACK)}
      />

      {pics.length > 1 && (
        <>
          <IconButton
            size="small"
            onClick={prev}
            sx={{
              position: "absolute",
              top: "50%",
              left: 10,
              transform: "translateY(-50%)",
              bgcolor: "rgba(0,0,0,.55)",
              color: "#fff",
              "&:hover": { bgcolor: "rgba(0,0,0,.75)" },
            }}
          >
            <ChevronLeft />
          </IconButton>

          <IconButton
            size="small"
            onClick={next}
            sx={{
              position: "absolute",
              top: "50%",
              right: 10,
              transform: "translateY(-50%)",
              bgcolor: "rgba(0,0,0,.55)",
              color: "#fff",
              "&:hover": { bgcolor: "rgba(0,0,0,.75)" },
            }}
          >
            <ChevronRight />
          </IconButton>
        </>
      )}
    </Box>
  );
}
