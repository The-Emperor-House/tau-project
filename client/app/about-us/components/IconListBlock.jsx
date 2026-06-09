import { Box, Stack, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import HandshakeIcon from "@mui/icons-material/Handshake";
import EngineeringIcon from "@mui/icons-material/Engineering";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import { motion } from "framer-motion";

export default function IconListBlock() {
  const servicesDetail = [
    { icon: <SearchIcon />, text: "Survey Area" },
    { icon: <LightbulbIcon />, text: "Concept Design & Estimate Price" },
    { icon: <HandshakeIcon />, text: "Perspective & Sign Contract" },
    { icon: <EngineeringIcon />, text: "Construction In Progress & Material Approve" },
    { icon: <AssignmentTurnedInIcon />, text: "Handover" },
  ];

  return (
    <Box sx={{ textAlign: "center", mt: 4 }}>
      <Stack spacing={{ xs: 3, md: 4 }} direction="column" alignItems="center" sx={{ width: "100%" }}>
        {servicesDetail.map((item, idx) => (
          <Stack
            key={idx}
            direction="row"
            alignItems="center"
            spacing={{ xs: 2.5, md: 3 }}
            component={motion.div}
            whileHover={{ scale: 1.03 }}
            sx={{
              width: "100%",
              maxWidth: { xs: 480, md: 560 },   // กว้างขึ้น
              mx: "auto",
              minHeight: { xs: 80, md: 92 },    // สูงขึ้นเล็กน้อยให้ดูโปร่ง
            }}
          >
            {/* ICON */}
            <Box
              sx={{
                bgcolor: "#ab9685",
                borderRadius: "50%",
                width: { xs: 72, md: 84 },       // วงใหญ่ขึ้น
                height: { xs: 72, md: 84 },
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                "& svg": {                        // ขนาดไอคอนใหญ่ขึ้น
                  fontSize: { xs: 34, md: 40 },
                },
              }}
            >
              {item.icon}
            </Box>

            {/* TEXT */}
            <Typography
              variant="body1"
              color="black"
              sx={{
                textAlign: "left",
                fontSize: { xs: "1.05rem", md: "1.2rem" }, // ตัวอักษรใหญ่ขึ้น
                lineHeight: 1.5,
                letterSpacing: "0.02rem",
                wordBreak: "break-word",
              }}
            >
              {item.text}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}
