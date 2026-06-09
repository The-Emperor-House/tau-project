"use client";

import { useEffect, useState } from "react";
import { Box, Typography, Skeleton } from "@mui/material";
import { useParams } from "next/navigation";

import GridCard from "../components/GridCard";
import GalleryModal from "../components/GalleryModal";

export default function TypePage() {
  const { type } = useParams();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);

  const palette = {
    bg: "#404040",
    text: "#E7D6C6",
    accent: "#ab9685",
    faint: "rgba(255,255,255,0.08)",
    accent2: "#BFA68A",
    white: "#FFFFFF",
  };

  useEffect(() => {
    if (!type) {
      setLoading(false);
      setProjects([]);
      return;
    }
    const load = async () => {
      setLoading(true);
      try {
        const apiUrl = `${
          process.env.NEXT_PUBLIC_API_URL
        }/api/projects?type=${String(type).toUpperCase()}`;
        const res = await fetch(apiUrl);
        const json = await res.json();
        if (Array.isArray(json)) setProjects(json);
        else if (json && Array.isArray(json.data)) setProjects(json.data);
        else setProjects([]);
      } catch {
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [type]);

  const onProjectClick = (project) => setSelectedProject(project);
  const onModalClose = () => setSelectedProject(null);

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        bgcolor: palette.bg,
        color: palette.text,
      }}
    >
      <Box
        sx={{
          maxWidth: { xs: "100%", md: "1200px" },
          mx: "auto",
          px: { xs: 2, sm: 3, md: 4, lg: 6 },
          pt: { xs: "140px", md: "270px" },
          pb: { xs: 6, md: 10 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mb: { xs: 3, md: 6 },
            px: { xs: 0, md: 2 },
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "auto auto",
              alignItems: "end",
              columnGap: { xs: 2, sm: 2.5, md: 3, lg: 4 },
            }}
          >
            <Typography
              component="div"
              sx={{
                fontWeight: 700,
                color: palette.accent2,
                letterSpacing: { xs: ".20em", md: ".24em", lg: ".26em" },
                fontSize: {
                  xs: "2.6rem",
                  sm: "3.4rem",
                  md: "6rem",
                  lg: "7rem",
                  xl: "7.6rem",
                },
                lineHeight: 1,
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
            >
              PROJECT
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: { xs: "flex-start", md: "flex-start" },
                gap: { xs: 0.5, md: 1 },
                pb: { xs: 0.4, md: 0.8 },
              }}
            >
              <Typography
                component="div"
                sx={{
                  color: palette.white,
                  fontWeight: 300,
                  letterSpacing: { xs: ".42em", md: ".50em", lg: ".56em" },
                  fontSize: {
                    xs: "1.25rem",
                    sm: "1.4rem",
                    md: "2.1rem",
                    lg: "2.35rem",
                  },
                  lineHeight: 1,
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                }}
              >
                {(typeof type === "string" ? type : "").toUpperCase()}
              </Typography>

              <Typography
                component="div"
                sx={{
                  color: palette.accent2,
                  fontWeight: 300,
                  letterSpacing: { xs: ".36em", md: ".40em", lg: ".44em" },
                  fontSize: {
                    xs: "0.95rem",
                    sm: "1rem",
                    md: "1.15rem",
                    lg: "1.3rem",
                  },
                  lineHeight: 1.15,
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                  opacity: 0.95,
                }}
              >
                PORTFOLIO
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            position: "relative",
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: 'repeat(2, 1fr)',
              md: 'repeat(2, 1fr)',
              lg: 'repeat(2, 1fr)',
              xl: 'repeat(3, 1fr)',
            },
            gap: { xs: 3, md: 4, lg: 5 },
            alignItems: "stretch",
          }}
        >
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Box key={i}>
                  {/* skeleton 4:3 */}
                  <Box sx={{ position: "relative", width: "100%" }}>
                    <Box sx={{ pt: "75%" }} />
                    <Skeleton
                      variant="rectangular"
                      sx={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        bgcolor: "rgba(255,255,255,0.08)",
                      }}
                    />
                  </Box>
                  <Skeleton
                    width="70%"
                    height={28}
                    sx={{
                      mt: 1.5,
                      mx: "auto",
                      bgcolor: "rgba(255,255,255,0.08)",
                    }}
                  />
                </Box>
              ))
            : projects.map((project, i) => (
                <Box
                  key={project.id ?? i}
                  sx={{ display: "flex", flexDirection: "column" }}
                >
                  <GridCard data={project} onClick={onProjectClick} />
                </Box>
              ))}
        </Box>
      </Box>

      {selectedProject && (
        <GalleryModal open onClose={onModalClose} data={selectedProject} />
      )}
    </Box>
  );
}
