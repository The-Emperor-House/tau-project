"use client";

import Link from "next/link";
import { Box, Typography, Button } from "@mui/material";
import { motion } from "framer-motion";
import AboutBlock from "./AboutBlock";
import ServiceBlock from "./ServiceBlock";
import IconListBlock from "./IconListBlock";

const servicesList = ["สร้างใหม่", "ปรับปรุงต่อเติม - ซ่อมแซม", "ออกแบบตกแต่งภายใน"];

const fadeInUpVariant = {
  hidden: { opacity: 0, y: 50 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      type: "spring",
      stiffness: 80,
      damping: 15,
      duration: 1.0,
      ease: [0.2, 0.65, 0.3, 0.9],
    },
  }),
};

export default function AboutUsSection() {
  const categories = [
    { name: "HOME" },
    { name: "CONDOMINIUM" },
    { name: "HOTEL" },
    { name: "OFFICE" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 md:px-8 lg:px-16">
      {/* 1) ABOUT */}
      <Box className="relative">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUpVariant}
          custom={1}
          style={{ width: "100%", height: "100%" }}
        >
          <AboutBlock />
        </motion.div>

        <div className="hidden md:block absolute right-[-12px] top-0 h-full w-px bg-black/20" />
      </Box>

      {/* 2) SERVICE */}
      <Box className="relative">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUpVariant}
          custom={2}
          style={{ width: "100%", height: "100%" }}
        >
          <ServiceBlock />
        </motion.div>
      </Box>

      {/* 3) ICON LIST */}
      <Box>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUpVariant}
          custom={3}
          style={{ width: "100%", height: "100%" }}
        >
          <IconListBlock />
        </motion.div>
      </Box>

      {/* BOTTOM TEXT + READ MORE */}
      <Box className="md:col-span-3 mt-26">
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { xs: "center", md: "center" },
            justifyContent: { xs: "center", md: "space-between" },
            gap: 2,
            textAlign: { xs: "center", md: "left" },
          }}
        >
          {/* ซ้าย: ข้อความ 2 บรรทัด */}
          <Box sx={{ width: "100%" }}>
            <Typography
              variant="body1"
              sx={{
                fontWeight: 500,
                mb: 1,
                letterSpacing: "0.05rem",
                fontSize: { xs: "0.8rem", sm: "1rem", md: "1.2rem" },
                ml: { xs: 0, md: 6 },
              }}
            >
              {servicesList.join(" | ")}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                fontWeight: 300,
                color: "#000",
                letterSpacing: "0.05rem",
                fontSize: { xs: "0.95rem", sm: "1rem", md: "1.2rem" },
                opacity: 0.8,
                ml: { xs: 0, md: 13 },
              }}
            >
              {categories.map((c) => c.name).join(" | ")}
            </Typography>
          </Box>

          {/* ขวา: ปุ่ม */}
          <Button
            component={Link}
            href="/about-us"
            variant="contained"
            disableElevation
            sx={{
              bgcolor: "#ab9685",
              color: "#ffffff",
              borderRadius: "9999px",
              letterSpacing: "0.25rem",
              fontWeight: 800,
              px: 3.5,
              py: 1.1,
              textTransform: "uppercase",
              "&:hover": { bgcolor: "#9b8575" },
              "&:active": { bgcolor: "#8f7a69" },
              "&:focus-visible": {
                outline: "2px solid rgba(171,150,133,.5)",
                outlineOffset: 2,
              },
              alignSelf: { xs: "center", md: "unset" },
              mt: { xs: 1.5, md: 0 },
            }}
          >
            READ&nbsp;MORE
          </Button>
        </Box>
      </Box>
    </div>
  );
}
