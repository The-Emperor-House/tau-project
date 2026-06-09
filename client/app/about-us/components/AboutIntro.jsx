"use client";

import { Container, Box, Typography } from "@mui/material";
import { ABOUT_INTRO_TITLE, ABOUT_INTRO_TEXT } from "../_data/aboutIntro";

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
            color: "#ab9685",
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

export default function AboutIntro() {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
      <Box sx={{ textAlign: "center", maxWidth: 800, mx: "auto" }}>
        <Typography
          variant="h5"
          color="primary"
          fontWeight="bold"
          sx={{ mb: 2, letterSpacing: "0.1em" }}
        >
          {ABOUT_INTRO_TITLE}
        </Typography>

        <Paragraphs text={ABOUT_INTRO_TEXT} />
      </Box>
    </Container>
  );
}
