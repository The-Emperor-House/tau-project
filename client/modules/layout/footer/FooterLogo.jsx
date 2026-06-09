import Image from "next/image";
import { Box } from "@mui/material";

export default function FooterLogo({ src }) {
  return (
    <Box
      sx={{
        position: "relative",
        width: { xs: 120, sm: 140, md: 200 },
        height: { xs: 80, sm: 90, md: 120 },
        mx: { xs: "auto", md: 0 }, // center on mobile
      }}
    >
      <Image
        src={src}
        alt="Taurus Logo"
        fill
        sizes="(max-width: 600px) 120px, (max-width: 900px) 140px, 200px"
        style={{ objectFit: "contain" }}
        priority
      />
    </Box>
  );
}
