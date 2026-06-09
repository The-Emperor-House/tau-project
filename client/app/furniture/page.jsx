"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Skeleton,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import FurnitureCard from "./components/FurnitureCard";
import { useRouter } from "next/navigation";

const BG = "#404040";
const TEXT = "#fff";
const ACCENT = "#BFA68A";

export default function FurnitureListPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("ALL");

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const q = type !== "ALL" ? `?type=${type}` : "";
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/furniture${q}`,
          { signal: ctrl.signal }
        );
        const data = res.ok ? await res.json() : [];
        setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        if (e.name !== "AbortError") setItems([]);
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, [type]);

  return (
    <Box
      sx={{
        bgcolor: BG,
        color: TEXT,
        minHeight: "100svh",
        pt: { xs: "120px", md: "160px" },
        pb: 8,
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, md: 3 } }}>
        {/* Header */}
        <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, md: 3 } }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr auto 1fr",
              alignItems: "center",
              gap: 2,
              mb: 3,
            }}
          >
            <Typography
              sx={{
                gridColumn: "2",
                justifySelf: "center",
                fontWeight: 200,
                letterSpacing: { xs: ".12em", md: ".16em" },
                fontSize: { xs: "1.6rem", md: "2.2rem" },
                textTransform: "uppercase",
                lineHeight: 1,
              }}
            >
              Furniture
            </Typography>
          </Box>
        </Box>

        {/* Filter */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
          <ToggleButtonGroup
            value={type}
            exclusive
            onChange={(_, v) => v && setType(v)}
            sx={{
              "& .MuiToggleButton-root": {
                color: TEXT,
                borderColor: "rgba(255,255,255,.2)",
              },
              "& .Mui-selected": {
                bgcolor: ACCENT,
                color: TEXT,
                "&:hover": { bgcolor: "rgba(191,166,138,.8)" },
              },
            }}
          >
            <ToggleButton value="ALL">ALL</ToggleButton>
            <ToggleButton value="BUILT_IN">BUILT-IN</ToggleButton>
            <ToggleButton value="LOOSE">LOOSE</ToggleButton>
            <ToggleButton value="CUSTOM">CUSTOM</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Grid */}
        <Grid container spacing={3}>
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                  <Skeleton
                    variant="rectangular"
                    sx={{
                      width: "100%",
                      aspectRatio: "16 / 9",
                      mb: 1.5,
                      bgcolor: "rgba(255,255,255,.08)",
                    }}
                  />
                  <Skeleton width="80%" height={24} />
                  <Skeleton width="60%" height={20} />
                </Grid>
              ))
            : items.map((it) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={it.id}>
                  <FurnitureCard
                    item={it}
                    onClick={() => router.push(`/furniture/${it.id}`)}
                  />
                </Grid>
              ))}
        </Grid>
      </Box>
    </Box>
  );
}
