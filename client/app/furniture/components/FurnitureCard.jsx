"use client";

import { useMemo, useState, useEffect } from "react";
import { Box, Card, Button, Typography, Skeleton } from "@mui/material";
import Image from "next/image";

const ACCENT = "#BFA68A";
const PANEL = "#FFFFFF";
const TEXT = "#111111";

export default function FurnitureCard({ item, onClick }) {
  const srcCandidate = useMemo(
    () =>
      item?.coverUrl ||
      item?.imageUrl ||
      item?.images?.[0]?.imageUrl ||
      "/images/default-data.jpg",
    [item]
  );

  const [loaded, setLoaded] = useState(false);
  const [imgSrc, setImgSrc] = useState(srcCandidate);
  useEffect(() => setImgSrc(srcCandidate), [srcCandidate]);

  const dims = [item?.width, item?.depth, item?.height]
    .every((n) => typeof n === "number")
    ? `W${item.width} x D${item.depth} x H${item.height} cm`
    : "";

  const priceText = typeof item?.price === "number" ? `${item.price.toLocaleString("th-TH")} บาท` : "";

  return (
    <Card elevation={0} sx={{ width: "100%", borderRadius: 0, boxShadow: "none", overflow: "hidden", bgcolor: "transparent" }}>
      <Box sx={{ position: "relative", width: "100%", cursor: "pointer" }} onClick={() => onClick?.(item)}>
        <Box sx={{ position: "relative", width: "100%", aspectRatio: "16 / 9" }}>
          {!loaded && <Skeleton variant="rectangular" sx={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />}
          <Image
            src={imgSrc}
            alt={item?.name || "furniture"}
            fill
            sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{ objectFit: "cover" }}
            unoptimized
            onLoad={() => setLoaded(true)}
            onError={() => {
              if (imgSrc !== "/images/default-data.jpg") setImgSrc("/images/default-data.jpg");
            }}
          />
        </Box>
      </Box>

      <Box sx={{ bgcolor: PANEL, px: { xs: 2.5, md: 3 }, py: { xs: 2.5, md: 3 } }}>
        <Typography sx={{ color: TEXT, fontSize: { xs: "1.05rem", md: "1.15rem" }, fontWeight: 700 }}>
          {item?.name || ""}
        </Typography>
        {item?.details && (
          <Typography sx={{ color: TEXT, fontSize: { xs: ".95rem", md: "1rem" }, mt: .5 }}>
            {item.details}
          </Typography>
        )}
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 1 }}>
          {dims && (
            <Typography sx={{ color: TEXT, fontSize: { xs: ".95rem", md: "1rem" } }}>
              {dims}
            </Typography>
          )}
          {priceText && (
            <Typography sx={{ color: TEXT, fontSize: { xs: ".95rem", md: "1rem" }, fontWeight: 700 }}>
              {priceText}
            </Typography>
          )}
        </Box>

        <Button
          onClick={() => onClick?.(item)}
          fullWidth
          sx={{
            mt: { xs: 2, md: 2.5 },
            py: { xs: 1.1, md: 1.2 },
            borderRadius: 0,
            bgcolor: ACCENT,
            color: "#000",
            textTransform: "none",
            fontSize: { xs: "1rem", md: "1.05rem" },
            fontWeight: 800,
            letterSpacing: ".12em",
            "&:hover": { bgcolor: "#a88e72", textDecoration: "underline" },
          }}
        >
          VIEW
        </Button>
      </Box>
    </Card>
  );
}
