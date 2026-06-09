import { IconButton } from "@mui/material";

const hoverPrimaryMd = {
  transition: (t) =>
    t.transitions.create("color", { duration: t.transitions.duration.shorter }),
  "&:hover": { color: { xs: "inherit", md: "primary.main" } },
};

export default function SocialIcon({ href, label, children }) {
  return (
    <IconButton
      component="a"
      href={href}
      aria-label={label}
      target="_blank"
      rel="noopener noreferrer"
      color="inherit"
      disableRipple
      sx={{
        p: 0.5,
        ...hoverPrimaryMd,
        "&:focus-visible": (t) => ({
          outline: `2px solid ${t.palette.primary.main}`,
          outlineOffset: 2,
        }),
      }}
    >
      {children}
    </IconButton>
  );
}
