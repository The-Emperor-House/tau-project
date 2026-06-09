import { Box, Typography } from "@mui/material";
import { FaPhoneAlt } from "react-icons/fa";
import { IoLocationSharp } from "react-icons/io5";

const hoverPrimaryMd = {
  transition: (t) =>
    t.transitions.create("color", { duration: t.transitions.duration.shorter }),
  "&:hover": { color: { xs: "inherit", md: "primary.main" } },
};

export default function HeadOffice() {
  return (
    <Box>
      <Typography
        variant="h6"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: { xs: "center", md: "flex-start" },
          gap: 1,
          fontWeight: 700,
          letterSpacing: "0.03rem",
          mb: 0.75,
          textAlign: { xs: "center", md: "left" },
          ...hoverPrimaryMd,
        }}
      >
        <IoLocationSharp size={18} />
        Head Office :
      </Typography>

      <Typography
        variant="body1"
        sx={{
          color: "rgba(255,255,255,0.9)",
          fontSize: { xs: "0.98rem", md: "1.05rem" },
          lineHeight: 1.7,
          textAlign: { xs: "center", md: "left" },
        }}
      >
        288/18 Phaholyothin Rd.
        <br />
        Anusawaree , Bangkhen , Bangkok 10220
      </Typography>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: { xs: "center", md: "flex-start" },
          gap: 1,
          mt: 1,
        }}
      >
        <FaPhoneAlt />
        <Typography
          variant="body1"
          sx={{
            color: "rgba(255,255,255,0.9)",
            letterSpacing: { xs: "0.08rem", md: "0.18rem" },
            fontSize: { xs: "0.98rem", md: "1.05rem" },
            ...hoverPrimaryMd,
          }}
        >
          (66) 2 970 3080 - 3 / (66) 61 0596111
        </Typography>
      </Box>
    </Box>
  );
}
