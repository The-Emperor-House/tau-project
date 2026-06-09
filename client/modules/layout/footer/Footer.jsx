"use client";

import { Box, Container } from "@mui/material";
import Grid from "@mui/material/Grid";

import FooterLogo from "./FooterLogo";
import HeadOffice from "./HeadOffice";
import ShowroomAndSocial from "./ShowroomAndSocial";
import ResponsiveDivider from "./ResponsiveDivider";

export default function Footer() {
  const logoSrc = "/logo/LOGO NEW TAURUS WHITE.png";

  return (
    <Box
      component="footer"
      sx={{ py: { xs: 4, md: 5 }, bgcolor: "#404040", color: "#fff" }}
    >
      <Container maxWidth="xl">
        <Grid
          container
          spacing={{ xs: 3, md: 4 }}
          alignItems="center"
          sx={{ flexWrap: { xs: "wrap", md: "wrap", lg: "nowrap" } }}
        >
          {/* 1) FooterLogo */}
          <Grid
            size={{ xs: 12, md: 12, lg: 2 }}
            sx={{ flexShrink: 0, minWidth: { md: 180, lg: 200 } }}
          >
            <FooterLogo src={logoSrc} />
          </Grid>

          {/* 2) HeadOffice */}
          <Grid size={{ xs: 12, md: 12 }} sx={{ pl: { lg: 1 } }}>
            <HeadOffice />
          </Grid>

          {/* 3) ResponsiveDivider (แนวนอนบน mobile / แนวตั้งบน desktop) */}
          <Grid size={{ xs: 12, md: 12 }} sx={{ display: { xs: "block", md: "none" } }}>
            <ResponsiveDivider />
          </Grid>

          {/* 4) Showroom + Social */}
          <Grid size={{ xs: 12, md: 12 }} sx={{ pr: { lg: 1 } }}>
            <ShowroomAndSocial />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
