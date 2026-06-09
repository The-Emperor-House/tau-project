"use client";

import React, { useEffect, useState, useRef } from "react";
import { Box, Typography, Button, Stack, Snackbar, Alert, Divider } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import SectionBlock from "./components/SectionBlock";
import DesignFormDialog from "./components/DesignFormDialog";
import useModalContext from "@/shared/hooks/useModalContext";

export default function DashboardDesign() {
  const [architectural, setArchitectural] = useState([]);
  const [interior, setInterior] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openForm, setOpenForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({ id: null, name: "", type: "ARCHITECTURAL", coverUrl: "", images: [] });
  const [coverPreview, setCoverPreview] = useState(null);
  const [imagesPreview, setImagesPreview] = useState([]);
  const [deleteImageIds, setDeleteImageIds] = useState(new Set());
  const coverInputRef = useRef(null);
  const imagesInputRef = useRef(null);

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const colors = { bg: "#404040", text: "#FFFFFF", accent: "#cc8f2a" };
  const { showLoading, hideLoading, confirm } = useModalContext();

  const fetchDesigns = async () => {
    setLoading(true);
    try {
      const { getSession } = await import("next-auth/react");
      const session = await getSession();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/designs`, {
        headers: { Authorization: `Bearer ${session?.backendToken}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setArchitectural(data.filter((d) => d.type === "ARCHITECTURAL"));
      setInterior(data.filter((d) => d.type === "INTERIOR"));
    } catch {
      setSnackbar({ open: true, message: "Failed to load designs", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDesigns(); }, []);

  const resetFileInputs = () => {
    if (coverInputRef.current) coverInputRef.current.value = null;
    if (imagesInputRef.current) imagesInputRef.current.value = null;
  };

  const handleOpenAdd = () => {
    setFormData({ id: null, name: "", type: "ARCHITECTURAL", coverUrl: "", images: [] });
    setCoverPreview(null);
    setImagesPreview([]);
    setDeleteImageIds(new Set());
    setIsEditing(false);
    setOpenForm(true);
    resetFileInputs();
  };

  const handleEdit = (item) => {
    setFormData({ id: item.id, name: item.name, type: item.type, coverUrl: item.coverUrl || "", images: item.images || [] });
    setCoverPreview(item.coverUrl || null);
    setImagesPreview(item.images ? item.images.map((img) => img.imageUrl) : []);
    setDeleteImageIds(new Set());
    setIsEditing(true);
    setOpenForm(true);
    resetFileInputs();
  };

  const handleDelete = async (id) => {
    const ok = await confirm({
      title: "Delete design?",
      message: "การลบจะไม่สามารถย้อนกลับได้ ต้องการลบรายการนี้หรือไม่",
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    if (!ok) return;

    showLoading("Deleting...");
    try {
      const { getSession } = await import("next-auth/react");
      const session = await getSession();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/designs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session?.backendToken}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setSnackbar({ open: true, message: "Deleted", severity: "success" });
      fetchDesigns();
    } catch {
      setSnackbar({ open: true, message: "Failed to delete", severity: "error" });
    } finally {
      hideLoading();
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setSnackbar({ open: true, message: "Name is required", severity: "warning" });
      return;
    }

    const form = new FormData();
    form.append("name", formData.name);
    form.append("type", formData.type);
    if (coverInputRef.current?.files[0]) form.append("cover", coverInputRef.current.files[0]);
    if (imagesInputRef.current?.files?.length) Array.from(imagesInputRef.current.files).forEach((f) => form.append("images", f));
    if (deleteImageIds.size) form.append("deleteImageIds", Array.from(deleteImageIds).join(","));

    showLoading(isEditing ? "Updating..." : "Creating...");
    const method = isEditing ? "PUT" : "POST";
    const url = isEditing
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/designs/${formData.id}`
      : `${process.env.NEXT_PUBLIC_API_URL}/api/designs`;

    try {
      const { getSession } = await import("next-auth/react");
      const session = await getSession();
      const res = await fetch(url, { method, headers: { Authorization: `Bearer ${session?.backendToken}` }, body: form });
      if (!res.ok) throw new Error();
      setSnackbar({ open: true, message: isEditing ? "Updated" : "Created", severity: "success" });
      setOpenForm(false);
      fetchDesigns();
    } catch {
      setSnackbar({ open: true, message: "Failed to submit", severity: "error" });
    } finally {
      hideLoading();
    }
  };

  const onRemoveImage = (i) => {
    // ถ้าแก้ไข: mark เพื่อลบรูปเดิม
    const url = imagesPreview[i];
    const existing = formData.images.find((img) => img.imageUrl === url);
    if (existing) setDeleteImageIds((prev) => new Set(prev).add(existing.id));
    setImagesPreview((prev) => prev.filter((_, idx) => idx !== i));
  };

  return (
    <Box sx={{ bgcolor: "#000", color: "#fff", minHeight: "100svh", width: "100%", pt: { xs: "140px", md: "270px" } }}>
      <Box sx={{ maxWidth: 1400, mx: "auto", px: 2, pb: 6 }}>
        <Box>
          <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "stretch", sm: "center" }} justifyContent="space-between" mb={2} gap={2}>
            <Typography variant="h4" fontWeight="bold" textAlign={{ xs: "center", sm: "left" }}>
              Dashboard: Design Management
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenAdd}
              sx={{ bgcolor: colors.accent, color: "#000", fontWeight: 700, "&:hover": { bgcolor: "#b57b14" } }}
            >
              Add New
            </Button>
          </Stack>

          <Divider sx={{ mb: 3, borderColor: "rgba(255,255,255,0.18)" }} />

          <SectionBlock title="Architectural Design" items={architectural} loading={loading} onEdit={handleEdit} onDelete={handleDelete} colors={colors} />
          <Box my={4} />
          <SectionBlock title="Interior Design" items={interior} loading={loading} onEdit={handleEdit} onDelete={handleDelete} colors={colors} />
        </Box>

        <DesignFormDialog
          open={openForm}
          onClose={() => setOpenForm(false)}
          onSubmit={handleSubmit}
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

        <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
          <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: "100%" }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}
