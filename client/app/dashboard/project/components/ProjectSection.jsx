"use client";

import { Box, Grid, Card, CardContent, Stack, Button, Skeleton, Typography } from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { motion } from "framer-motion";

export default function ProjectSection({ title, items, loading, onEdit, onDelete, colors }) {
  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" sx={{ color: colors.accent, mb: 2 }}>
        {title}
      </Typography>

      <Grid container spacing={3}>
        {(loading ? Array.from({ length: 6 }) : items).map((item, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item?.id || index}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column", borderRadius: 3, boxShadow: 4 }}>
                {loading ? (
                  <>
                    <Box sx={{ position: "relative", width: "100%", overflow: "hidden", borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
                      <Box sx={{ pt: "56.25%" }} />
                      <Skeleton variant="rectangular" sx={{ position: "absolute", inset: 0 }} />
                    </Box>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Skeleton width="80%" height={24} sx={{ mb: 1 }} />
                      <Skeleton width="60%" height={20} />
                    </CardContent>
                    <Stack direction="row" spacing={1} p={2} justifyContent="flex-end">
                      <Skeleton variant="rectangular" width={70} height={30} />
                      <Skeleton variant="rectangular" width={70} height={30} />
                    </Stack>
                  </>
                ) : (
                  <>
                    {/* 16:9 cover */}
                    <Box sx={{ position: "relative", width: "100%", overflow: "hidden", borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
                      <Box sx={{ pt: "56.25%" }} />
                      <img
                        src={item.coverUrl || "/no-image.jpg"}
                        alt={item.name}
                        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </Box>

                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" fontWeight="bold" color="text.primary" gutterBottom>
                        {item.name}
                      </Typography>
                      {(item.details || item.areaSize) && (
                        <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-line" }}>
                          {item.details || ""}
                          {item.areaSize ? `\nพื้นที่ใช้สอย ${item.areaSize} ตรม.` : ""}
                        </Typography>
                      )}
                    </CardContent>

                    <Stack direction="row" spacing={1} p={2} justifyContent="flex-end">
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => onEdit(item)}
                        sx={{ color: colors.accent, borderColor: colors.accent, "&:hover": { borderColor: colors.accent } }}
                      >
                        Edit
                      </Button>
                      <Button variant="outlined" color="error" size="small" startIcon={<DeleteIcon />} onClick={() => onDelete(item.id)}>
                        Delete
                      </Button>
                    </Stack>
                  </>
                )}
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
