"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  Divider,
  Snackbar,
  Alert,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import useModalContext from "@/shared/hooks/useModalContext";
import NewsFormDialog from "./components/NewsFormDialog";

const COLORS = { accent: "#cc8f2a" };

export default function DashboardNews() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openForm, setOpenForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    id: null,
    heading1: "",
    heading2: "",
    body: "",
    videoUrl: "",
    coverUrl: "",
    images: [],
  });
  const [coverPreview, setCoverPreview] = useState(null);
  const [imagesPreview, setImagesPreview] = useState([]);
  const [deleteImageIds, setDeleteImageIds] = useState(new Set());
  const coverInputRef = useRef(null);
  const imagesInputRef = useRef(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const { showLoading, hideLoading, confirm } = useModalContext();

  const fetchNews = async () => {
    setLoading(true);
    try {
      const { getSession } = await import("next-auth/react");
      const session = await getSession();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/news`, {
        headers: { Authorization: `Bearer ${session?.backendToken}` },
      });
      const data = await res.json();
      setNews(Array.isArray(data) ? data : []);
    } catch {
      setSnackbar({
        open: true,
        message: "Failed to load news",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchNews();
  }, []);

  const resetFiles = () => {
    coverInputRef.current && (coverInputRef.current.value = null);
    imagesInputRef.current && (imagesInputRef.current.value = null);
  };

  const openAdd = () => {
    setFormData({
      id: null,
      heading1: "",
      heading2: "",
      body: "",
      videoUrl: "",
      coverUrl: "",
      images: [],
    });
    setCoverPreview(null);
    setImagesPreview([]);
    setDeleteImageIds(new Set());
    setIsEditing(false);
    setOpenForm(true);
    resetFiles();
  };

  const onEdit = (item) => {
    setFormData({
      id: item.id,
      heading1: item.heading1,
      heading2: item.heading2 || "",
      body: item.body || "",
      videoUrl: item.videoUrl || "",
      coverUrl: item.coverUrl || "",
      images: item.images || [],
    });
    setCoverPreview(item.coverUrl || null);
    setImagesPreview(item.images?.map((i) => i.imageUrl) || []);
    setDeleteImageIds(new Set());
    setIsEditing(true);
    setOpenForm(true);
    resetFiles();
  };

  const onRemoveImage = (i) => {
    const url = imagesPreview[i];
    const existing = formData.images.find((img) => img.imageUrl === url);
    if (existing) setDeleteImageIds((prev) => new Set(prev).add(existing.id));
    setImagesPreview((prev) => prev.filter((_, idx) => idx !== i));
  };

  const onDelete = async (id) => {
    const ok = await confirm({
      title: "Delete news?",
      message: "ต้องการลบบทความนี้หรือไม่",
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    if (!ok) return;
    showLoading("Deleting...");
    try {
      const { getSession } = await import("next-auth/react");
      const session = await getSession();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/news/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${session?.backendToken}` },
        }
      );
      if (!res.ok) throw new Error();
      setSnackbar({ open: true, message: "Deleted", severity: "success" });
      fetchNews();
    } catch {
      setSnackbar({ open: true, message: "Delete failed", severity: "error" });
    } finally {
      hideLoading();
    }
  };

  const onSubmit = async () => {
    if (!formData.heading1.trim()) {
      setSnackbar({
        open: true,
        message: "Heading 1 is required",
        severity: "warning",
      });
      return;
    }

    const fd = new FormData();
    fd.append("heading1", formData.heading1);
    if (formData.heading2) fd.append("heading2", formData.heading2);
    if (formData.body) fd.append("body", formData.body);
    if (formData.videoUrl) fd.append("videoUrl", formData.videoUrl);
    if (coverInputRef.current?.files[0])
      fd.append("cover", coverInputRef.current.files[0]);
    if (imagesInputRef.current?.files?.length)
      Array.from(imagesInputRef.current.files).forEach((f) =>
        fd.append("images", f)
      );
    if (deleteImageIds.size)
      fd.append("deleteImageIds", Array.from(deleteImageIds).join(","));

    showLoading(isEditing ? "Updating..." : "Creating...");
    const method = isEditing ? "PUT" : "POST";
    const url = isEditing
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/news/${formData.id}`
      : `${process.env.NEXT_PUBLIC_API_URL}/api/news`;
    try {
      const { getSession } = await import("next-auth/react");
      const session = await getSession();
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${session?.backendToken}` },
        body: fd,
      });
      if (!res.ok) throw new Error();
      setSnackbar({
        open: true,
        message: isEditing ? "Updated" : "Created",
        severity: "success",
      });
      setOpenForm(false);
      fetchNews();
    } catch {
      setSnackbar({ open: true, message: "Submit failed", severity: "error" });
    } finally {
      hideLoading();
    }
  };

  return (
    <Box
      sx={{
        bgcolor: "#000",
        color: "#fff",
        minHeight: "100svh",
        width: "100%",
        pt: { xs: "140px", md: "270px" },
      }}
    >
      <Box sx={{ maxWidth: 1400, mx: "auto", px: 2, pb: 6 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "stretch", sm: "center" }}
          justifyContent="space-between"
          gap={2}
          mb={2}
        >
          <Typography variant="h4" fontWeight={700}>
            Dashboard: News & Events
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openAdd}
            sx={{
              bgcolor: COLORS.accent,
              color: "#000",
              fontWeight: 700,
              "&:hover": { bgcolor: "#b57b14" },
            }}
          >
            Add News
          </Button>
        </Stack>

        <Divider sx={{ mb: 3, borderColor: "rgba(255,255,255,0.18)" }} />

        <Grid container spacing={3}>
          {(loading ? Array.from({ length: 6 }) : news).map((it, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={it?.id || i}>
              <Card
                sx={{ borderRadius: 3, overflow: "hidden", height: "100%" }}
              >
                {/* cover 16:9 */}
                <Box sx={{ position: "relative" }}>
                  <Box sx={{ pt: "56.25%" }} />
                  {!loading && (
                    <img
                      src={it.coverUrl}
                      alt={it.heading1}
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  )}
                </Box>
                <CardContent
                  sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
                >
                  {loading ? (
                    <Box
                      sx={{ height: 60, bgcolor: "#111", borderRadius: 1 }}
                    />
                  ) : (
                    <>
                      {/* หัวข้อหลัก */}
                      <Typography
                        variant="subtitle1"
                        fontWeight={700}
                        sx={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2, // จำกัด 2 บรรทัด
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          mb: 1,
                        }}
                      >
                        {it.heading1}
                      </Typography>

                      {/* หัวข้อรอง */}
                      {it.heading2 && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {it.heading2}
                        </Typography>
                      )}

                      {/* ปุ่ม */}
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="flex-end"
                        sx={{ mt: "auto" }} // ดันปุ่มไปก้นการ์ด
                      >
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => onEdit(it)}
                          sx={{
                            color: COLORS.accent,
                            borderColor: COLORS.accent,
                            "&:hover": { borderColor: COLORS.accent },
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<DeleteIcon />}
                          onClick={() => onDelete(it.id)}
                        >
                          Delete
                        </Button>
                      </Stack>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <NewsFormDialog
          open={openForm}
          onClose={() => setOpenForm(false)}
          onSubmit={onSubmit}
          formData={formData}
          setFormData={setFormData}
          coverPreview={coverPreview}
          setCoverPreview={setCoverPreview}
          imagesPreview={imagesPreview}
          setImagesPreview={setImagesPreview}
          coverInputRef={coverInputRef}
          imagesInputRef={imagesInputRef}
          onRemoveImage={onRemoveImage}
        />

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}
