"use client";
import { Card, Box, CardContent, Typography } from "@mui/material";

export default function NewsCard({ item, onClick }) {
  return (
    <Card
      onClick={() => onClick?.(item)}
      sx={{ cursor: "pointer", borderRadius: 3, overflow: "hidden", height: "100%" }}
      elevation={3}
    >
      <Box sx={{ position: "relative", width: "100%", overflow: "hidden" }}>
        <Box sx={{ pt: "56.25%" }} />
        <img
          src={item.coverUrl}
          alt={item.heading1}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
      </Box>
      <CardContent>
        <Typography variant="subtitle1" fontWeight={700}>
          {item.heading1}
        </Typography>
        {item.heading2 && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: .5 }}>
            {item.heading2}
          </Typography>
        )}
        <Typography variant="caption" color="text.secondary">
          {new Date(item.createdAt).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}
        </Typography>
      </CardContent>
    </Card>
  );
}
