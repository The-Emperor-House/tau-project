"use client";

import { Box, Typography, Container } from "@mui/material";
import Grid from "@mui/material/Grid";
import Image from "next/image";
import { serviceItems } from "../_data/services";

const BG = "#f2e8df";
const ACC = "#b89d8b";
const BODY = "#8b7e72";
const DIV = "rgba(0,0,0,0.06)";

function Heading({ item, align = "left" }) {
  return (
    <Box
      sx={{ textAlign: { xs: "center", md: align }, mb: { xs: 2.5, md: 3.5 } }}
    >
      <Typography
        component="div"
        sx={{
          fontSize: { xs: "4.5rem", md: "7.5rem" }, // ↑ ใหญ่ขึ้น
          fontWeight: 700,
          color: ACC,
          lineHeight: 1,
          mb: 1.2,
        }}
      >
        {item.no}
      </Typography>
      <Typography
        variant="h6"
        sx={{
          letterSpacing: ".6rem",
          fontWeight: 800,
          color: "#4e4e4e",
          textIndent: ".6rem",
          fontSize: { xs: "1.05rem", md: "1.25rem" }, // ↑
        }}
      >
        {item.title}
      </Typography>
      <Typography
        variant="h6"
        sx={{
          mt: 0.6,
          color: ACC,
          fontWeight: 800,
          letterSpacing: ".12rem",
          fontSize: { xs: "1.05rem", md: "1.2rem" }, // ↑
        }}
      >
        {item.subtitleTH}
      </Typography>
    </Box>
  );
}

function Image16x9({ src, alt, objectPosition = "center" }) {
  return (
    <Box sx={{ position: "relative" }}>
      <Box
        sx={{
          position: "relative",
          width: "100%",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <Box sx={{ pt: { xs: "56.25%", md: "62.5%" } }} />
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 900px) 100vw, 33vw"
          style={{ objectFit: "cover", objectPosition }}
        />
      </Box>
    </Box>
  );
}

function TextBody({ children, align = "left" }) {
  return (
    <Typography
      variant="body1"
      sx={{
        color: BODY,
        lineHeight: 2.05,
        letterSpacing: ".025rem",
        fontSize: { xs: "1rem", md: "1.1rem" },
        textAlign: { xs: "center", md: align },
      }}
    >
      {children}
    </Typography>
  );
}

export default function ServiceShowcase() {
  const s1 = serviceItems[0];
  const s2 = serviceItems[1];
  const s3 = serviceItems[2];

  return (
    <Box
      sx={{
        bgcolor: BG,
        minHeight: { xs: "100dvh", md: "100vh" },
        width: "100%",
        py: { xs: 8, md: 12 },
      }}
    >
      <Container maxWidth="xl">
        <Box sx={{ mb: { xs: 6, md: 8 } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 1.5 }}>
            <Box sx={{ flex: 1, height: 2, bgcolor: DIV }} />
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                letterSpacing: ".06em",
                color: "#3a3a3a",
                textAlign: "center",
                fontSize: { xs: "1.4rem", md: "1.8rem" },
              }}
            >
              บริการรีโนเวทแบบครบวงจร
            </Typography>
            <Box sx={{ flex: 1, height: 2, bgcolor: DIV }} />
          </Box>
          <Typography
            variant="h6"
            sx={{
              textAlign: "center",
              letterSpacing: ".1em", // ↑
              color: "#3a3a3a",
              fontSize: { xs: "1rem", md: "1.15rem" }, // ↑
            }}
          >
            สร้างใหม่ | ปรับปรุงต่อเติม - ซ่อมแซม | ออกแบบตกแต่งภายใน
          </Typography>
        </Box>

        {/* กล่องเดียว ครอบทั้ง 3 ส่วน */}
        <Box
          sx={{
            bgcolor: BG,
            p: { xs: 4, md: 6 },
          }}
        >
          <Grid container columns={12} spacing={{ xs: 4, md: 6 }}>
            {/* ↑ spacing */}
            {/* คอลัมน์ 1 */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ height: "100%", pr: { md: 3 }, pb: { xs: 3, md: 0 } }}>
                <Heading item={s1} align="left" />
                <TextBody align="left">{s1.descriptionTH}</TextBody>
                <Box sx={{ mt: 3 }}>
                  <Image16x9
                    src={s1.image}
                    alt={s1.title}
                    objectPosition="left"
                  />
                </Box>
              </Box>
            </Grid>

            {/* คอลัมน์ 2 (รูปก่อน) */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ height: "100%", px: { md: 3 }, py: { xs: 3, md: 0 } }}>
                <Box sx={{ mb: { xs: 2.5, md: 8 } }}>
                  <Image16x9 src={s2.image} alt={s2.title} />
                </Box>

                <Heading item={s2} align="center" />
                <Box sx={{ mt: 3 }}>
                  <TextBody align="center">{s2.descriptionTH}</TextBody>
                </Box>
              </Box>
            </Grid>

            {/* คอลัมน์ 3 */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ height: "100%", pl: { md: 3 }, pt: { xs: 3, md: 0 } }}>
                <Heading item={s3} align="right" />
                <TextBody align="right">{s3.descriptionTH}</TextBody>
                <Box sx={{ mt: 3 }}>
                  <Image16x9
                    src={s3.image}
                    alt={s3.title}
                    objectPosition="right"
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}
