"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Box, Typography, Grid, Skeleton, Alert, Divider } from "@mui/material";
import MediaEmbed from "@/shared/components/ui/MediaEmbed";

const FALLBACK_COVER = "/images/default-news.jpg";
const ACCENT = "#cc8f2a";

/* ทำ URL ให้ใช้ได้ทุกกรณี */
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

/* label ซ้าย เช่น "TAURUS :" จาก heading1 */
function extractLabel(h1 = "") {
  const s = String(h1).trim();
  if (!s) return "NEWS :";
  if (s.includes(":")) return `${s.split(":")[0].trim().toUpperCase()} :`;
  return `${s.split(/\s+/)[0].toUpperCase()} :`;
}

/* วันที่หัวใหญ่กลางหน้า (ใช้ createdAt เดี่ยว ๆ) */
function formatDateLine(d) {
  const dt = new Date(d);
  const day = dt.getDate();
  const month = dt.toLocaleString("en-US", { month: "long" }).toUpperCase();
  const year = dt.getFullYear();
  return `${day} ${month} ${year}`;
}

export default function NewsDetail() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [item, setItem] = useState(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!id) return;
    const ctrl = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/news/${id}`, {
          signal: ctrl.signal,
        });
        if (!res.ok) throw new Error("ไม่พบข่าวหรือเกิดข้อผิดพลาด");
        const data = await res.json();
        setItem(data);
        setImgSrc(resolveUrl(data?.coverUrl) || FALLBACK_COVER);
      } catch (e) {
        if (e.name !== "AbortError") setErr(e.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, [id]);

  const dateLine = useMemo(
    () => (item?.createdAt ? formatDateLine(item.createdAt) : ""),
    [item?.createdAt]
  );

  return (
    <Box
      sx={{
        bgcolor: "#000",
        color: "#fff",
        minHeight: "100svh",
        width: "100%",
        pt: { xs: "120px", md: "160px" },
        display: "flex",          // ✅ กัน footer ลอย
        flexDirection: "column",  // ✅
      }}
    >
      <Box
        sx={{
          maxWidth: 1200,
          mx: "auto",
          px: { xs: 2, md: 3 },
          pb: 8,
          flex: 1,                // ✅ ดันให้คอนเทนต์กินพื้นที่ที่เหลือ
          width: "100%",
        }}
      >
        {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}

        {/* เส้นคั่น + วันที่ตัวใหญ่กลางหน้า */}
        <Divider sx={{ borderColor: "rgba(255,255,255,0.12)", mb: 1.5 }} />
        <Typography
          sx={{
            textAlign: "center",
            fontWeight: 800,
            letterSpacing: ".08em",
            fontSize: { xs: "1.2rem", md: "1.8rem" },
            textTransform: "uppercase",
            mb: { xs: 2, md: 3 },
            whiteSpace: "nowrap",            // ✅ ป้องกันยาวเกิน
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          title={dateLine}
        >
          {loading ? <Skeleton width={260} sx={{ mx: "auto" }} /> : dateLine}
        </Typography>

        {/* ===== 2 คอลัมน์: ซ้ายสื่อหลัก / ขวาข้อความ ===== */}
        <Grid container spacing={{ xs: 2, md: 4 }}>
          {/* ซ้าย: วิดีโอถ้ามี ไม่งั้นรูปปก */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Box
              sx={{
                position: "relative",
                width: "100%",
                aspectRatio: "16 / 9",
                overflow: "hidden",
                borderRadius: 2,
                bgcolor: "#111",
              }}
            >
              {loading ? (
                <Skeleton variant="rectangular" sx={{ position: "absolute", inset: 0 }} />
              ) : item?.videoUrl ? (
                <Box sx={{ position: "absolute", inset: 0 }}>
                  <MediaEmbed url={item.videoUrl} />
                </Box>
              ) : (
                <img
                  src={imgSrc || FALLBACK_COVER}
                  alt={item?.heading1 || "news cover"}
                  onError={() => setImgSrc(FALLBACK_COVER)}
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  loading="eager"
                />
              )}
            </Box>
          </Grid>

          {/* ขวา: label + title + body (ย่อหน้า) */}
          <Grid size={{ xs: 12, md: 4 }}>
            {loading ? (
              <>
                <Skeleton width="35%" height={28} sx={{ mb: 1 }} />
                <Skeleton width="80%" height={42} sx={{ mb: 2 }} />
                <Skeleton width="100%" height={18} />
                <Skeleton width="95%" height={18} />
                <Skeleton width="90%" height={18} />
              </>
            ) : (
              <>
                {/* label — 1 บรรทัด */}
                <Typography
                  sx={{
                    color: ACCENT,
                    fontWeight: 800,
                    letterSpacing: ".06em",
                    textTransform: "uppercase",
                    fontSize: { xs: "1rem", md: "1.15rem" },
                    mb: 1,
                    display: "-webkit-box",
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  title={extractLabel(item?.heading1)}
                >
                  {extractLabel(item?.heading1)}
                </Typography>

                {/* หัวข้อ — 3 บรรทัด */}
                <Typography
                  sx={{
                    fontWeight: 900,
                    fontSize: { xs: "1.6rem", md: "2rem" },
                    lineHeight: 1.15,
                    mb: 2,
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    wordBreak: "break-word",
                  }}
                  title={item?.heading2 || item?.heading1 || "-"}
                >
                  {item?.heading2 || item?.heading1 || "-"}
                </Typography>

                {/* เนื้อหา — ปล่อยเต็ม แต่กันคำยาว ๆ แตกบรรทัด */}
                {item?.body && (
                  <Typography
                    sx={{
                      whiteSpace: "pre-wrap",
                      lineHeight: 1.9,
                      overflowWrap: "anywhere", // ✅ กันคำติดกันยาวๆ
                    }}
                  >
                    {item.body}
                  </Typography>
                )}
              </>
            )}
          </Grid>
        </Grid>

        {/* ===== Gallery ด้านล่าง ===== */}
        {!loading && (item?.images?.length ?? 0) > 0 && (
          <Box sx={{ position: "relative", zIndex: 0, mt: 4 }}>
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{
                mb: 2,
                display: "-webkit-box",
                WebkitLineClamp: 1,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              title={`Gallery (${item.images.length})`}
            >
              Gallery ({item.images.length})
            </Typography>
            <Grid container spacing={2}>
              {item.images.map((img, i) => {
                const src = resolveUrl(img?.imageUrl);
                return (
                  <Grid size={{ xs: 6, sm: 4, md: 3 }} key={img?.id ?? i}>
                    <Box
                      sx={{
                        position: "relative",
                        width: "100%",
                        aspectRatio: "1 / 1",
                        overflow: "hidden",
                        borderRadius: 1,
                        bgcolor: "#111",
                      }}
                    >
                      <img
                        src={src || FALLBACK_COVER}
                        alt=""
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = FALLBACK_COVER;
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
                );
              })}
            </Grid>
          </Box>
        )}
      </Box>
      {/* Footer ของแอปจะตามอยู่ข้างล่าง เพราะเราใช้ flex column + flex:1 ด้านบน */}
    </Box>
  );
}
