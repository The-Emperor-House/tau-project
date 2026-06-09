import { Box, Typography } from "@mui/material";
import { ABOUT_INTRO_TEXT } from "../_data/aboutIntro";

function Paragraphs({ text }) {
  const paras = text.trim().split(/\n\s*\n/);
  return (
    <Box
      sx={{
        maxWidth: { xs: '58ch', md: '68ch' },
        mx: 'auto',
      }}
    >
      {paras.map((p, i) => (
        <Typography
          key={i}
          variant="body2"
          paragraph
          sx={{
            mt: i === 0 ? 1.5 : 0,
            color: '#111',
            lineHeight: 1.85,
            letterSpacing: '0.01rem',
            fontSize: { xs: '0.95rem', sm: '1.05rem', md: '1.15rem' },

            // ใส่ย่อบรรทัดแรก (ถ้าชอบสไตล์นี้)
            textIndent: { md: '1.25rem' },

            overflowWrap: 'anywhere',
            wordBreak: 'break-word',
            hyphens: 'auto',
            WebkitHyphens: 'auto',
            textWrap: 'pretty',

            textRendering: 'optimizeLegibility',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
          }}
        >
          {p}
        </Typography>
      ))}
    </Box>
  );
}

export default function AboutBlock() {
  return (
    <Box
      sx={{
        textAlign: { xs: "center", md: "left" },
        maxWidth: { xs: 700, md: "none" },
        mx: "auto",
        pl: { xs: 0, md: 6 }, // ขยับทางขวาเฉพาะจอใหญ่
      }}
    >

      {/* แบรนด์/สโลแกน */}
      <Typography
        variant="subtitle1"
        sx={{
          color: "#cc8f2a",
          fontWeight: 700,
          letterSpacing: "0.2rem",
          fontSize: { xs: "1.2rem", sm: "1.5rem", md: "2rem" },
        }}
      >
        TAURUS :
      </Typography>

      <Typography
        variant="subtitle1"
        sx={{
          color: "#000",
          fontWeight: 700,
          letterSpacing: "0.1rem",
          mt: -0.5,
          textTransform: "uppercase",
          fontSize: { xs: "1.2rem", sm: "1.5rem", md: "2rem" },
        }}
      >
        WE RENEW
      </Typography>

      {/* คำโปรยไทย */}
      <Typography
        variant="body2"
        sx={{
          textAlign: "center",
          mt: 2,
          color: "#000000ff",
          letterSpacing: "0.2rem",
          fontSize: { xs: "0.8rem", sm: "1rem", md: "1.2rem" },
        }}
      >
        “สร้างบ้านหลังใหม่ ในที่อยู่อาศัยเดิมของคุณ”
      </Typography>

      {/* เนื้อหาอธิบาย */}
      <Paragraphs text={ABOUT_INTRO_TEXT} />

    </Box>
  );
}
