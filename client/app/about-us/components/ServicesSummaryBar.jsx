"use client";

import { Box, Typography } from "@mui/material";

export default function ServicesSummaryBar({
  services = [],
  categories = [],
}) {
  return (
    <Box sx={{ textAlign: "center", pb: { xs: 6, md: 8 } }}>
      <Typography variant="body1" sx={{ fontWeight: 500, mb: 1.5, letterSpacing: "0.05rem" }}>
        {services.join(" | ")}
      </Typography>
      <Typography
        variant="body2"
        sx={{ fontWeight: 300, color: "#000", letterSpacing: "0.05rem" }}
      >
        {categories.map(c => c.name).join(" | ")}
      </Typography>
    </Box>
  );
}
