import { Box, Stack, Typography, Button } from "@mui/material";
import { motion } from "framer-motion";

export default function ServiceBlock() {
  const servicesMain = [
    { title: "REBUILD", subtitle: "สร้างใหม่" },
    { title: "RENOVATE", subtitle: "ปรับปรุง ต่อเติม - ซ่อมแซม" },
    { title: "REDESIGN & DECORATE", subtitle: "ออกแบบตกแต่งภายใน" },
  ];

  return (
    <Box sx={{ textAlign: "center", mt: { xs: 4, md: 8 }, }}>
      <Typography
        variant="h4"
        color="black"
        fontWeight="light"
        mb={4}
        sx={{ letterSpacing: "0.4rem" }}
      >
        OUR SERVICE
      </Typography>

      <Stack spacing={{ xs: 3, md: 4 }} alignItems="center" width="100%">
        {servicesMain.map((item, idx) => (
          <Stack
            key={idx}
            spacing={{ xs: 1, md: 1.25 }}
            alignItems="center"
            sx={{ width: "auto" }}
          >
            <Button
              variant="contained"
              disableElevation
              component={motion.button}
              whileHover={{ scale: 1.03 }}
              sx={{
                display: "inline-flex",
                width: "auto",
                minWidth: 0,
                minHeight: { xs: 60, md: 80 },
                px: { xs: 5, md: 7 },
                bgcolor: "#f5ede5",
                color: "black",
                fontWeight: 700,
                letterSpacing: "0.35em",
                textAlign: "center",
                fontSize: { xs: "0.95rem", md: "1.05rem" },
                borderRadius: "9999px",
                "&:hover": { bgcolor: "#e5dbcf" },
              }}
            >
              {item.title}
            </Button>

            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                textAlign: "center",
                letterSpacing: "0.2em",
                fontSize: { xs: "0.9rem", md: "1rem" },
                opacity: 0.9,
              }}
            >
              {item.subtitle}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}
