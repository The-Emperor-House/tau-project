"use client";

import { Box, Typography } from "@mui/material";

export default function AboutHeroBanner() {
  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: { xs: "48vh", md: "50vh" },
        backgroundImage: "url('/about-us/banner.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        textAlign: "center",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          bgcolor: "rgba(0, 0, 0, 0.5)",
          zIndex: 1,
        }}
      />
      <Box
        sx={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          px: 2,
        }}
      >
        <Typography 
          variant="h3"
          color="#000000ff"
          component="h1" 
          fontWeight="bold" 
          sx={{ letterSpacing: "0.05em" }}>
          ABOUT US
        </Typography>
        <Typography
          variant="h3"
          color="primary"
          fontWeight="bold"
          sx={{ 
            textTransform: "uppercase", 
            letterSpacing: "0.2em", 
            mt: 1,
            fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" }
          }}
        >
          RECRAFTING SPACE.
          <br />
          REVIVING LIVING.
        </Typography>
        <Typography
          variant="h6"
          fontWeight="light"
          color="#fff"
          sx={{ 
            letterSpacing: "0.1em", 
            mt: 2, 
            maxWidth: 600,
            fontSize: { xs: "0.9rem", sm: "1rem", md: "1.2rem" }
          }}
        >
          “สร้างบ้านหลังใหม่ ในที่อยู่อาศัยเดิมของคุณ”
        </Typography>
      </Box>
    </Box>
  );
}
