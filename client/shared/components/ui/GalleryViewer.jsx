"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  IconButton,
  Dialog,
  DialogContent,
  useMediaQuery,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import ChevronRight from "@mui/icons-material/ChevronRight";
import { useTheme } from "@mui/material/styles";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export default function GalleryViewer({
  images = [],
  aspectRatio = "16 / 9",
  initialIndex = 0,
  thumbHeight = 70,
}) {
  const imgs = (images || []).filter(Boolean);
  const [index, setIndex] = useState(clamp(initialIndex, 0, Math.max(0, imgs.length - 1)));
  const [open, setOpen] = useState(false);

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const trackRef = useRef(null);
  const touchRef = useRef({ x: 0, y: 0, t: 0 });

  useEffect(() => {
    setIndex((i) => clamp(i, 0, Math.max(0, imgs.length - 1)));
  }, [imgs.length]);

  // keyboard nav in lightbox
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const prev = () => setIndex((i) => (i - 1 + imgs.length) % imgs.length);
  const next = () => setIndex((i) => (i + 1) % imgs.length);
  const openLightbox = () => setOpen(true);

  // swipe handlers
  const onTouchStart = (e) => {
    const t = e.touches?.[0];
    if (!t) return;
    touchRef.current = { x: t.clientX, y: t.clientY, t: Date.now() };
  };
  const onTouchEnd = (e) => {
    const t = e.changedTouches?.[0];
    if (!t) return;
    const dx = t.clientX - touchRef.current.x;
    const dt = Date.now() - touchRef.current.t;
    if (dt < 600 && Math.abs(dx) > 40) {
      if (dx < 0) next();
      else prev();
    }
  };

  const thumbs = useMemo(() => imgs.map((src, i) => ({ src, i })), [imgs]);

  if (!imgs.length) return null;

  return (
    <Box>
      {/* Viewer (inline) */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          aspectRatio,
          overflow: "hidden",
          borderRadius: 2,
          bgcolor: "#111",
        }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <img
          src={imgs[index]}
          alt=""
          onClick={openLightbox}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            cursor: "zoom-in",
            display: "block",
          }}
          loading="eager"
        />

        {/* Prev / Next */}
        {imgs.length > 1 && (
          <>
            <IconButton
              aria-label="previous"
              onClick={prev}
              sx={{
                position: "absolute",
                top: "50%",
                left: 8,
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
                top: "50%",
                right: 8,
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
      </Box>

      {/* Thumbnails */}
      {imgs.length > 1 && (
        <Box
          ref={trackRef}
          sx={{
            mt: 1.5,
            display: "flex",
            gap: 1,
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
            pb: 0.5,
          }}
        >
          {thumbs.map(({ src, i }) => (
            <Box
              key={`${src}-${i}`}
              onClick={() => setIndex(i)}
              sx={{
                position: "relative",
                height: thumbHeight,
                aspectRatio: "1 / 1",
                borderRadius: 1,
                overflow: "hidden",
                outline: i === index ? "2px solid #BFA68A" : "1px solid rgba(255,255,255,.15)",
                cursor: "pointer",
                flex: "0 0 auto",
              }}
            >
              <img
                src={src}
                alt=""
                loading="lazy"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </Box>
          ))}
        </Box>
      )}

      {/* Lightbox */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullScreen={fullScreen}
        maxWidth="lg"
        PaperProps={{
          sx: {
            bgcolor: "#000",
            color: "#fff",
          },
        }}
      >
        <IconButton
          aria-label="close"
          onClick={() => setOpen(false)}
          sx={{ position: "absolute", top: 8, right: 8, color: "#fff", zIndex: 1 }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent
          sx={{
            p: 0,
            position: "relative",
            display: "grid",
            placeItems: "center",
            minHeight: fullScreen ? "100dvh" : 600,
            bgcolor: "#000",
          }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <img
            src={imgs[index]}
            alt=""
            style={{
              maxWidth: "100%",
              maxHeight: "90vh",
              objectFit: "contain",
              display: "block",
            }}
          />

          {imgs.length > 1 && (
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
