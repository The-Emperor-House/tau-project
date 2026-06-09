import { Box, Typography } from "@mui/material";
import { FaLine } from "react-icons/fa";
import { SiTiktok } from "react-icons/si";
import { MdEmail } from "react-icons/md";
import { CgFacebook } from "react-icons/cg";
import { FaInstagram } from "react-icons/fa6";
import { IoLocationSharp } from "react-icons/io5";
import SocialIcon from "./SocialIcon";
import SectionTitle from "./SectionTitle";

const hoverPrimaryMd = {
  transition: (t) =>
    t.transitions.create("color", { duration: t.transitions.duration.shorter }),
  "&:hover": { color: { xs: "inherit", md: "primary.main" } },
};

export default function ShowroomAndSocial() {
  return (
    <Box>
      <SectionTitle icon={<IoLocationSharp size={18} />}>Showroom :</SectionTitle>

      <Typography
        variant="body1"
        sx={{
          color: "rgba(255,255,255,0.9)",
          fontSize: { xs: "0.98rem", md: "1.05rem" },
          lineHeight: 1.7,
          textAlign: { xs: "center", md: "left" },
        }}
      >
        189/9-10 Ratchada-Ramintra Rd.
        <br />
        Nuanchan , Buengkum , Bangkok 10240
      </Typography>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: { xs: "center", md: "flex-start" },
          gap: 1,
          mt: 1.5,
          flexWrap: "wrap",
        }}
      >
        <SocialIcon href="https://line.me/ti/p/~salestaurus" label="Line">
          <FaLine />
        </SocialIcon>

        <SocialIcon href="mailto:taurus@emperorhouse.com" label="Email">
          <MdEmail />
        </SocialIcon>

        <Typography
          variant="body1"
          sx={{
            mx: 1,
            color: "rgba(255,255,255,0.9)",
            letterSpacing: "0.02rem",
            textAlign: { xs: "center", md: "left" },
            ...hoverPrimaryMd,
          }}
        >
          ติดตามผลงานเพิ่มเติมของเราได้ที่
        </Typography>

        <SocialIcon href="https://facebook.com/TaurusByEmperor" label="Facebook">
          <CgFacebook />
        </SocialIcon>

        <SocialIcon href="https://www.instagram.com/showroomtaurus" label="Instagram">
          <FaInstagram />
        </SocialIcon>

        <SocialIcon href="https://www.tiktok.com/@taurus.by.emperor" label="TikTok">
          <SiTiktok />
        </SocialIcon>

        <Typography
          variant="body1"
          sx={{
            ml: 1,
            color: "rgba(255,255,255,0.9)",
            whiteSpace: "nowrap",
            textAlign: { xs: "center", md: "left" },
            ...hoverPrimaryMd,
          }}
        >
          Taurus
        </Typography>
      </Box>
    </Box>
  );
}
