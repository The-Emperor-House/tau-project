import { Box } from "@mui/material";
import Grid from "@mui/material/Grid";

export default function ResponsiveDivider() {
  return (
    <>
      {/* vertical on desktop */}
      <Box
        sx={{
          display: { xs: "none", md: "block" },
          width: "1px",
          alignSelf: "stretch",
          mx: { md: 3 },
          bgcolor: "rgba(255,255,255,0.45)",
        }}
      />
      {/* horizontal on mobile */}
      <Grid size={12} sx={{ display: { xs: "block", md: "none" } }}>
        <Box sx={{ borderBottom: "1px solid rgba(255,255,255,0.35)" }} />
      </Grid>
    </>
  );
}
