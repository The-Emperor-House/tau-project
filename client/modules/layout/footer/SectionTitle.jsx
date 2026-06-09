import { Typography } from "@mui/material";

// hover สี primary.main เฉพาะ md+
const hoverPrimaryMd = {
  transition: (t) =>
    t.transitions.create("color", { duration: t.transitions.duration.shorter }),
  "&:hover": { color: { xs: "inherit", md: "primary.main" } },
};

export default function SectionTitle({ icon, children }) {
  return (
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
      {icon}
      {children}
    </Typography>
  );
}
