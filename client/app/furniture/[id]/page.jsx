"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Grid,
  Skeleton,
  Dialog,
  DialogContent,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import ChevronRight from "@mui/icons-material/ChevronRight";

const BG = "#404040";
const TEXT = "#fff";
const FALLBACK = "/images/default-data.jpg";

export default function FurnitureDetail() {
  const id =
    typeof window !== "undefined"
      ? window.location.pathname.split("/").pop()
      : null;

  const [item, setItem] = useState(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [loading, setLoading] = useState(true);

  // Lightbox state
  const [open, setOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);

  // รวบรวมรูปทั้งหมดเป็นอาเรย์ (ภาพปก + แกลเลอรี)
  const gallery = useMemo(() => {
    if (!item) return [];
    const pics = [];
    if (item.coverUrl) pics.push(item.coverUrl);
    if (Array.isArray(item.images)) {
      for (const im of item.images) if (im?.imageUrl) pics.push(im.imageUrl);
    }
    return pics;
  }, [item]);

  // index ภาพปกใน gallery (ถ้ามี)
  const coverIndex = item?.coverUrl ? 0 : null;

  useEffect(() => {
    if (!id) return;
    const ctrl = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/furniture/${id}`,
          { signal: ctrl.signal }
        );
        const data = res.ok ? await res.json() : null;
        setItem(data);
        setImgSrc(data?.coverUrl || FALLBACK);
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, [id]);

  // ขนาด W x D x H
  const dims = useMemo(() => {
    if (!item) return "";
    const { width, depth, height } = item;
    if ([width, depth, height].every((n) => typeof n === "number")) {
      return `W${width} x D${depth} x H${height} cm`;
    }
    return "";
  }, [item]);

  // --- Lightbox controls ---
  const prev = useCallback(
    () =>
      setStartIndex((i) => (gallery.length ? (i - 1 + gallery.length) % gallery.length : 0)),
    [gallery.length]
  );
  const next = useCallback(
    () =>
      setStartIndex((i) => (gallery.length ? (i + 1) % gallery.length : 0)),
    [gallery.length]
  );

  // keyboard nav
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, next, prev]);

  // touch swipe
  const touchRef = useState({ x: 0, t: 0 })[0];
  const onTouchStart = (e) => {
    const t = e.touches?.[0];
    if (!t) return;
    touchRef.x = t.clientX;
    touchRef.t = Date.now();
  };
  const onTouchEnd = (e) => {
    const t = e.changedTouches?.[0];
    if (!t) return;
    const dx = t.clientX - touchRef.x;
    const dt = Date.now() - touchRef.t;
    if (dt < 600 && Math.abs(dx) > 40) {
      if (dx < 0) next();
      else prev();
    }
  };

  return (
    <Box
      sx={{
        bgcolor: BG,
        color: TEXT,
        minHeight: "100svh",
        pt: { xs: "120px", md: "160px" },
        pb: 8,
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, md: 3 } }}>
        <Grid container spacing={{ xs: 2, md: 4 }}>
          {/* ซ้าย: ภาพปก (คง layout เดิม) */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Box
              sx={{
                position: "relative",
                width: "100%",
                aspectRatio: "16 / 9",
                overflow: "hidden",
                borderRadius: 2,
                bgcolor: "#111",
                cursor: gallery.length ? "zoom-in" : "default",
              }}
              onClick={() => {
                if (!gallery.length) return;
                setStartIndex(coverIndex ?? 0);
                setOpen(true);
              }}
            >
              {loading ? (
                <Skeleton
                  variant="rectangular"
                  sx={{ position: "absolute", inset: 0 }}
                />
              ) : (
                <img
                  src={imgSrc || FALLBACK}
                  alt={item?.name || "furniture"}
                  onError={() => setImgSrc(FALLBACK)}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              )}
            </Box>
          </Grid>

          {/* ขวา: รายละเอียด (คง layout เดิม) */}
          <Grid size={{ xs: 12, md: 5 }}>
            {loading ? (
              <>
                <Skeleton width="70%" height={36} sx={{ mb: 1 }} />
                <Skeleton width="50%" height={24} sx={{ mb: 2 }} />
                <Skeleton width="90%" height={18} />
                <Skeleton width="80%" height={18} />
              </>
            ) : (
              <>
                <Typography variant="h4" fontWeight={900} sx={{ mb: 1 }}>
                  {item?.name}
                </Typography>
                <Typography
                  sx={{
                    color: "#BFA68A",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: ".06em",
                    mb: 1,
                  }}
                >
                  {item?.type?.replace("_", "-")}
                </Typography>
                {dims && <Typography sx={{ mb: 1.5 }}>{dims}</Typography>}
                {typeof item?.price === "number" && (
                  <Typography sx={{ fontWeight: 800, mb: 2 }}>
                    {item.price.toLocaleString("th-TH")} บาท
                  </Typography>
                )}
                {item?.details && (
                  <Typography sx={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}>
                    {item.details}
                  </Typography>
                )}
              </>
            )}
          </Grid>
        </Grid>

        {!loading && gallery.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Gallery ({gallery.length})
            </Typography>

            <Grid container spacing={2}>
              {item.images.map((img, i) => (
                <Grid key={img?.id ?? i} size={{ xs: 6, sm: 4, md: 3 }}>
                  <Box
                    sx={{
                      position: "relative",
                      width: "100%",
                      aspectRatio: "1 / 1",
                      overflow: "hidden",
                      borderRadius: 1,
                      bgcolor: "#111",
                      cursor: "zoom-in",
                    }}
                    onClick={() => {
                      const base = coverIndex === 0 ? 1 : 0;
                      setStartIndex(base + i);
                      setOpen(true);
                    }}
                  >
                    <img
                      src={img.imageUrl || FALLBACK}
                      alt=""
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = FALLBACK;
                      }}
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Box>

      {/* Lightbox (ไม่แตะ layout ด้านบน ใช้ overlay แยก) */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullScreen
        PaperProps={{ sx: { bgcolor: "#000", color: "#fff" } }}
      >
        <IconButton
          aria-label="close"
          onClick={() => setOpen(false)}
          sx={{ position: "absolute", top: 8, right: 8, color: "#fff", zIndex: 2 }}
        >
          <CloseIcon />
        </IconButton>

        <DialogContent
          sx={{
            p: 0,
            position: "relative",
            display: "grid",
            placeItems: "center",
            minHeight: "100dvh",
            bgcolor: "#000",
          }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {gallery.length > 0 && (
            <img
              src={gallery[startIndex] || FALLBACK}
              alt=""
              onError={(e) => (e.currentTarget.src = FALLBACK)}
              style={{
                maxWidth: "100%",
                maxHeight: "90vh",
                objectFit: "contain",
                display: "block",
              }}
            />
          )}

          {gallery.length > 1 && (
            <>
              <IconButton
                aria-label="previous"
                onClick={prev}
                sx={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#fff",
                  bgcolor: "rgba(0,0,0,.35)",
                  "&:hover": { bgcolor: "rgba(0,0,0,.55)" },
                }}
              >
                <ChevronLeft />
              </IconButton>
              <IconButton
                aria-label="next"
                onClick={next}
                sx={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#fff",
                  bgcolor: "rgba(0,0,0,.35)",
                  "&:hover": { bgcolor: "rgba(0,0,0,.55)" },
                }}
              >
                <ChevronRight />
              </IconButton>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
