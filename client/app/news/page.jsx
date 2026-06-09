"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Box, Typography, Button, Skeleton, Alert, Divider } from "@mui/material";
import Grid from "@mui/material/Grid";
import MediaEmbed from "@/shared/components/ui/MediaEmbed";

const ACCENT = "#BFA68A";
const FRAME = "#333";
const FALLBACK_COVER = "/images/default-news.jpg";
const PAGE_SIZE = 5;

const resolveUrl = (u) => {
  if (!u) return null;
  if (u.startsWith("https://")) return u;
  if (u.startsWith("//")) return "https:" + u;
  if (u.startsWith("http://")) return u.replace(/^http:\/\//i, "https://");
  if (u.startsWith("/")) {
    const base = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");
    return base ? `${base}${u}` : u;
  }
  return u;
};
const dateLine = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }).toUpperCase() : "";

const extractLabel = (h1 = "") => {
  const s = String(h1).trim();
  if (!s) return "NEWS :";
  if (s.includes(":")) return `${s.split(":")[0].trim().toUpperCase()} :`;
  return `${s.split(/\s+/)[0].toUpperCase()} :`;
};

export default function NewsListPage() {
  const [allItems, setAllItems] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/news`, { signal: ctrl.signal });
        const data = res.ok ? await res.json() : [];
        const sorted = Array.isArray(data)
          ? [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          : [];
        setAllItems(sorted);
      } catch (e) {
        if (e.name !== "AbortError") setErr(e.message || "โหลดข้อมูลไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, []);

  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return allItems.slice(start, end);
  }, [allItems, page]);

  const totalPages = Math.max(1, Math.ceil(allItems.length / PAGE_SIZE));
  const canNext = page < totalPages;

  return (
    <Box
      sx={{
        bgcolor: "#404040",
        color: "#fff",
        minHeight: "100svh",
        pt: { xs: "140px", md: "250px" },
        display: "flex",            // 👈 ทำเป็นคอลัมน์ทั้งหน้า
        flexDirection: "column",    // 👈 เพื่อดัน footer ไปล่าง
      }}
    >
      <Box
        sx={{
          maxWidth: 1200,
          mx: "auto",
          px: { xs: 2, md: 3 },
          pb: 8,
          flex: 1,                 // 👈 กินพื้นที่ที่เหลือ (footer จะไม่ลอย)
          width: "100%",
        }}
      >
        {/* Header */}
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 2, mb: 4 }}>
          <Box sx={{ height: 1, bgcolor: "rgba(0, 0, 0, 1)" }} />
          <Typography
            sx={{
              fontWeight: 900,
              letterSpacing: ".12em",
              fontSize: { xs: "1.6rem", md: "2.4rem" },
              textTransform: "uppercase",
              textAlign: "center",
            }}
          >
            News & Events
          </Typography>
          <Box sx={{ height: 1, bgcolor: "rgba(0, 0, 0, 1)" }} />
        </Box>

        {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}

        {/* รายการข่าว */}
        {loading && allItems.length === 0
          ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <Box key={i} sx={{ mb: 5 }}>
                <Grid container spacing={{ xs: 2, md: 4 }}>
                  <Grid size={{ xs: 12, md: 7 }}>
                    <Box sx={{ border: `10px solid ${FRAME}`, borderRadius: 1 }}>
                      <Box sx={{ position: "relative", aspectRatio: "16 / 9", bgcolor: "#111" }}>
                        <Skeleton variant="rectangular" sx={{ position: "absolute", inset: 0 }} />
                      </Box>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 5 }}>
                    <Skeleton width="70%" height={32} sx={{ mb: 1 }} />
                    <Skeleton width="35%" height={22} sx={{ mb: 2 }} />
                    <Skeleton width="80%" height={20} />
                    <Skeleton width="65%" height={20} />
                    <Skeleton width="50%" height={20} sx={{ mb: 2 }} />
                    <Skeleton width={160} height={40} />
                  </Grid>
                </Grid>
              </Box>
            ))
          : pageItems.map((it) => {
              const cover = resolveUrl(it.coverUrl) || FALLBACK_COVER;
              return (
                <Box key={it.id} sx={{ mb: 6 }}>
                  <Grid container spacing={{ xs: 2, md: 4 }} alignItems="flex-start">
                    {/* ซ้าย: media */}
                    <Grid size={{ xs: 12, md: 7 }}>
                      <Box sx={{ border: `10px solid ${FRAME}`, borderRadius: 1 }}>
                        <Box sx={{ position: "relative", aspectRatio: "16 / 9", overflow: "hidden", bgcolor: "#111" }}>
                          {it.videoUrl ? (
                            <MediaEmbed url={it.videoUrl} />
                          ) : (
                            <img
                              src={cover}
                              alt={it.heading1 || "news cover"}
                              onError={(e) => (e.currentTarget.src = FALLBACK_COVER)}
                              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          )}
                        </Box>
                      </Box>
                    </Grid>

                    {/* ขวา: texts */}
                    <Grid size={{ xs: 12, md: 5 }}>
                      {/* วันที่ — 1 บรรทัด */}
                      <Typography
                        sx={{
                          fontWeight: 800,
                          fontSize: { xs: "1rem", md: "1.1rem" },
                          mb: 1,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                        title={dateLine(it.createdAt)}
                      >
                        {dateLine(it.createdAt)}
                      </Typography>

                      {/* หมวด (label) — 1 บรรทัด */}
                      <Typography
                        sx={{
                          color: ACCENT,
                          fontWeight: 800,
                          letterSpacing: ".06em",
                          textTransform: "uppercase",
                          display: "-webkit-box",
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                        title={extractLabel(it.heading1)}
                      >
                        {extractLabel(it.heading1)}
                      </Typography>

                      {/* หัวข้อหลัก — 2 บรรทัด */}
                      <Typography
                        sx={{
                          fontWeight: 900,
                          fontSize: { xs: "1.2rem", md: "1.4rem" },
                          lineHeight: 1.25,
                          mb: 1.5,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                        title={it.heading2 || it.heading1}
                      >
                        {it.heading2 || it.heading1}
                      </Typography>

                      {/* เนื้อหา — 3 บรรทัด (เลิก slice แบบเดิม) */}
                      {it.body && (
                        <Typography
                          sx={{
                            color: "rgba(255,255,255,.85)",
                            lineHeight: 1.7,
                            mb: 2,
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                          title={it.body}
                        >
                          {it.body}
                        </Typography>
                      )}

                      <Button
                        component={Link}
                        href={`/news/${it.id}`}
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
                    </Grid>
                  </Grid>
                </Box>
              );
            })}

        {/* ปุ่ม Next */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4, gap: 2 }}>
          <Button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={!canNext || loading}
            endIcon={<span style={{ fontSize: 18 }}>→</span>}
            sx={{
              px: 4,
              py: 1.4,
              borderRadius: 999,
              bgcolor: canNext ? ACCENT : "rgba(255,255,255,.2)",
              color: canNext ? "#000" : "rgba(255,255,255,.6)",
              fontWeight: 800,
              letterSpacing: ".18em",
              textTransform: "none",
              "&:hover": canNext ? { bgcolor: "#a88e72" } : {},
            }}
          >
            Next
          </Button>
        </Box>

        <Divider sx={{ mt: 6, borderColor: "rgba(255,255,255,.12)" }} />
      </Box>
      {/* Footer ของแอปจะตามมาข้างล่าง และชิดล่างเพราะ flex layout ด้านบน */}
    </Box>
  );
}
