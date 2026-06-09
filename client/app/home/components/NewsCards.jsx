"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Box, Typography, Button, Skeleton, Alert } from "@mui/material";
import Grid from "@mui/material/Grid";
import MediaEmbed from "@/shared/components/ui/MediaEmbed";

const ACCENT = "#BFA68A";
const FRAME = "#333";
const FALLBACK_COVER = "/images/default-news.jpg";

function resolveUrl(u) {
  if (!u) return null;
  if (u.startsWith("https://")) return u;
  if (u.startsWith("//")) return "https:" + u;
  if (u.startsWith("http://")) return u.replace(/^http:\/\//i, "https://");
  if (u.startsWith("/")) {
    const base = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");
    return base ? `${base}${u}` : u;
  }
  return u;
}
function extractLabel(h1 = "") {
  const s = String(h1).trim();
  if (!s) return "NEWS :";
  if (s.includes(":")) return `${s.split(":")[0].trim().toUpperCase()} :`;
  return `${s.split(/\s+/)[0].toUpperCase()} :`;
}
function dateLine(d) {
  if (!d) return "";
  return new Date(d)
    .toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    .toUpperCase();
}

export default function LatestNews({ title = "News & Events", showViewAll = true }) {
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setErr("");

        // พยายามใช้ limit=1 ก่อน
        let res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/news?limit=1`, { signal: ctrl.signal });
        let latest = null;
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length) latest = data[0];
        }
        // fallback: โหลดทั้งหมดแล้วเลือกตัวล่าสุดเอง
        if (!latest) {
          const rAll = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/news`, { signal: ctrl.signal });
          const all = rAll.ok ? await rAll.json() : [];
          if (Array.isArray(all) && all.length) {
            latest = [...all].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
          }
        }
        setNews(latest || null);
      } catch (e) {
        if (e.name !== "AbortError") setErr(e.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, []);

  const cover = useMemo(() => resolveUrl(news?.coverUrl) || FALLBACK_COVER, [news?.coverUrl]);

  if (err) {
    return (
      <Box sx={{ bgcolor: "#fff", color: "text.primary", px: { xs: 2, md: 3 }, py: 6 }}>
        <Alert severity="error">{err}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "#fff", color: "text.primary", px: { xs: 2, md: 3 }, py: 6 }}>
      {/* หัวข้อ */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          gap: 2,
          mb: 3,
        }}
      >
        <Box sx={{ height: 1, bgcolor: "#000000ff" }} />
        <Typography
          sx={{
            fontWeight: 900,
            letterSpacing: ".12em",
            fontSize: { xs: "1.4rem", md: "2rem" },
            textTransform: "uppercase",
            textAlign: "center",
          }}
        >
          {title}
        </Typography>
        <Box sx={{ height: 1, bgcolor: "#000000ff" }} />
      </Box>

      {/* บล็อกข่าวล่าสุด */}
      {loading || !news ? (
        <Grid container spacing={{ xs: 2, md: 4 }}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Box sx={{ border: `10px solid ${FRAME}`, borderRadius: 1 }}>
              <Box sx={{ position: "relative", aspectRatio: "16 / 9", bgcolor: "#f5f5f5" }}>
                <Skeleton variant="rectangular" sx={{ position: "absolute", inset: 0 }} />
              </Box>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <Skeleton width="60%" height={28} sx={{ mb: 1 }} />
            <Skeleton width="30%" height={20} sx={{ mb: 2 }} />
            <Skeleton width="85%" height={20} />
            <Skeleton width="70%" height={20} />
            <Skeleton width="55%" height={20} sx={{ mb: 2 }} />
            <Skeleton width={160} height={40} />
          </Grid>
        </Grid>
      ) : (
        <Grid container spacing={{ xs: 2, md: 4 }} alignItems="flex-start">
          {/* ซ้าย: สื่อหลัก */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Box sx={{ border: `10px solid ${FRAME}`, borderRadius: 1 }}>
              <Box sx={{ position: "relative", aspectRatio: "16 / 9", overflow: "hidden", bgcolor: "#f5f5f5" }}>
                {news.videoUrl ? (
                  <MediaEmbed url={news.videoUrl} />
                ) : (
                  <img
                    src={cover}
                    alt={news.heading1 || "news cover"}
                    onError={(e) => (e.currentTarget.src = FALLBACK_COVER)}
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                  />
                )}
              </Box>
            </Box>
          </Grid>

          {/* ขวา: ข้อมูล */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Typography sx={{ fontWeight: 800, fontSize: { xs: "1rem", md: "1.1rem" }, mb: 1 }}>
              {dateLine(news.createdAt)}
            </Typography>

            <Typography sx={{ color: ACCENT, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase" }}>
              {extractLabel(news.heading1)}
            </Typography>

            <Typography sx={{ fontWeight: 900, fontSize: { xs: "1.2rem", md: "1.4rem" }, lineHeight: 1.25, mb: 1.5 }}>
              {news.heading2 || news.heading1}
            </Typography>

            {news.body && (
              <Typography sx={{ color: "text.secondary", lineHeight: 1.7, mb: 2 }}>
                {news.body.length > 140 ? news.body.slice(0, 140) + "…" : news.body}
              </Typography>
            )}

            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Button
                component={Link}
                href={`/news/${news.id}`}
                variant="contained"
                sx={{
                  px: 3,
                  py: 1.2,
                  borderRadius: 999,
                  bgcolor: ACCENT,
                  color: "#000",
                  fontWeight: 800,
                  letterSpacing: ".12em",
                  "&:hover": { bgcolor: "#a88e72" },
                }}
              >
                READ MORE
              </Button>

              {showViewAll && (
                <Button
                  component={Link}
                  href="/news"
                  sx={{
                    px: 3,
                    py: 1.2,
                    borderRadius: 999,
                    border: `1px solid ${ACCENT}`,
                    color: ACCENT,
                    fontWeight: 700,
                    letterSpacing: ".12em",
                    "&:hover": { bgcolor: "rgba(191,166,138,.12)" },
                  }}
                >
                  VIEW ALL
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
