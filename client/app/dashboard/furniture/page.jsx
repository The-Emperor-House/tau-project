"use client";

import { useEffect, useRef, useState } from "react";
import { Box, Typography, Button, Card, CardContent, Stack, Skeleton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, IconButton, Snackbar, Alert, Divider } from "@mui/material";
import Grid from "@mui/material/Grid";
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Close as CloseIcon } from "@mui/icons-material";
import { useSession } from "next-auth/react";

const colors = { bg: "#000", text: "#fff", accent: "#cc8f2a" };

export default function DashboardFurniture() {
  const { data: session } = useSession();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openForm, setOpenForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    type: "BUILT_IN",
    details: "",
    price: "",
    width: "",
    depth: "",
    height: "",
    images: [],
    coverUrl: "",
  });

  const coverInputRef = useRef(null);
  const imagesInputRef = useRef(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [imagesPreview, setImagesPreview] = useState([]);
  const [deleteImageIds, setDeleteImageIds] = useState(new Set());
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/furniture`, {
        headers: { Authorization: `Bearer ${session?.backendToken}` },
      });
      const data = res.ok ? await res.json() : [];
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setSnackbar({ open: true, message: "Failed to load", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); /* eslint-disable-next-line */ }, [session?.backendToken]);

  const resetFiles = () => {
    if (coverInputRef.current) coverInputRef.current.value = null;
    if (imagesInputRef.current) imagesInputRef.current.value = null;
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({ id: null, name: "", type: "BUILT_IN", details: "", price: "", width: "", depth: "", height: "", images: [], coverUrl: "" });
    setCoverPreview(null);
    setImagesPreview([]);
    setDeleteImageIds(new Set());
    setOpenForm(true);
    resetFiles();
  };

  const handleEdit = (it) => {
    setIsEditing(true);
    setFormData({
      id: it.id,
      name: it.name,
      type: it.type,
      details: it.details || "",
      price: it.price ?? "",
      width: it.width ?? "",
      depth: it.depth ?? "",
      height: it.height ?? "",
      images: it.images || [],
      coverUrl: it.coverUrl || "",
    });
    setCoverPreview(it.coverUrl || null);
    setImagesPreview(it.images?.map((x) => x.imageUrl) || []);
    setDeleteImageIds(new Set());
    setOpenForm(true);
    resetFiles();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this furniture?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/furniture/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session?.backendToken}` },
      });
      if (!res.ok) throw new Error();
      setSnackbar({ open: true, message: "Deleted", severity: "success" });
      fetchItems();
    } catch {
      setSnackbar({ open: true, message: "Failed to delete", severity: "error" });
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    setCoverPreview(file ? URL.createObjectURL(file) : isEditing ? formData.coverUrl : null);
  };
  const handleRemoveCover = () => {
    setCoverPreview(null);
    if (coverInputRef.current) coverInputRef.current.value = null;
  };
  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length) {
      setImagesPreview((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    }
  };
  const handleRemoveImage = (index) => {
    if (!isEditing) return setImagesPreview((prev) => prev.filter((_, i) => i !== index));
    const url = imagesPreview[index];
    const ex = formData.images.find((im) => im.imageUrl === url);
    if (ex) {
      setDeleteImageIds((prev) => new Set(prev).add(ex.id));
    }
    setImagesPreview((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setSnackbar({ open: true, message: "Name required", severity: "warning" });
      return;
    }
    const form = new FormData();
    ["name", "type", "details", "price", "width", "depth", "height"].forEach((k) => form.append(k, String(formData[k] ?? "")));
    if (coverInputRef.current?.files?.[0]) form.append("cover", coverInputRef.current.files[0]);
    Array.from(imagesInputRef.current?.files || []).forEach((f) => form.append("images", f));
    if (deleteImageIds.size) form.append("deleteImageIds", Array.from(deleteImageIds).join(","));

    const method = isEditing ? "PUT" : "POST";
    const url = isEditing
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/furniture/${formData.id}`
      : `${process.env.NEXT_PUBLIC_API_URL}/api/furniture`;

    try {
      const res = await fetch(url, { method, headers: { Authorization: `Bearer ${session?.backendToken}` }, body: form });
      if (!res.ok) throw new Error();
      setSnackbar({ open: true, message: isEditing ? "Updated" : "Created", severity: "success" });
      setOpenForm(false);
      fetchItems();
    } catch {
      setSnackbar({ open: true, message: "Failed to submit", severity: "error" });
    }
  };

  return (
    <Box sx={{ bgcolor: colors.bg, color: colors.text, minHeight: "100svh", pt: { xs: "120px", md: "270px" }, pb: 6 }}>
      <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, md: 3 } }}>
        <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "stretch", sm: "center" }} justifyContent="space-between" gap={2} mb={2}>
          <Typography variant="h4" fontWeight={900}>Dashboard: Furniture</Typography>
          <Button startIcon={<AddIcon />} variant="contained" sx={{ bgcolor: colors.accent, color: "#000", fontWeight: 800, "&:hover": { bgcolor: "#b57b14" } }} onClick={handleOpenAdd}>
            Add New
          </Button>
        </Stack>
        <Divider sx={{ mb: 3, borderColor: "rgba(255,255,255,0.18)" }} />

        <Grid container spacing={3}>
          {(loading ? Array.from({ length: 6 }) : items).map((it, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={it?.id || i}>
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column", borderRadius: 2, boxShadow: 3 }}>
                {loading ? (
                  <>
                    <Box sx={{ position: "relative", aspectRatio: "16 / 9" }}>
                      <Skeleton variant="rectangular" sx={{ position: "absolute", inset: 0 }} />
                    </Box>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Skeleton width="80%" height={24} sx={{ mb: 1 }} />
                      <Skeleton width="60%" height={20} />
                    </CardContent>
                  </>
                ) : (
                  <>
                    <Box sx={{ position: "relative", aspectRatio: "16 / 9", overflow: "hidden", borderTopLeftRadius: 8, borderTopRightRadius: 8 }}>
                      <img src={it.coverUrl} alt={it.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                    </Box>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" fontWeight={700}>{it.name}</Typography>
                      {typeof it.price === "number" && <Typography sx={{ mt: .5 }}>{it.price.toLocaleString("th-TH")} บาท</Typography>}
                    </CardContent>
                    <Stack direction="row" spacing={1} p={2} justifyContent="flex-end">
                      <Button variant="outlined" size="small" startIcon={<EditIcon />} onClick={() => handleEdit(it)} sx={{ color: colors.accent, borderColor: colors.accent, "&:hover": { borderColor: colors.accent } }}>
                        Edit
                      </Button>
                      <Button variant="outlined" color="error" size="small" startIcon={<DeleteIcon />} onClick={() => handleDelete(it.id)}>
                        Delete
                      </Button>
                    </Stack>
                  </>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Form */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)} fullWidth maxWidth="sm">
        <DialogTitle>{isEditing ? "Edit Furniture" : "Add Furniture"}</DialogTitle>
        <DialogContent sx={{ display: "grid", gap: 2, mt: 1 }}>
          <TextField label="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} fullWidth required />
          <TextField select label="Type" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} fullWidth required>
            <MenuItem value="BUILT_IN">BUILT-IN</MenuItem>
            <MenuItem value="LOOSE">LOOSE</MenuItem>
            <MenuItem value="CUSTOM">CUSTOM</MenuItem>
          </TextField>
          <TextField label="Price (THB)" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
          <Stack direction="row" spacing={1}>
            <TextField label="Width (cm)" value={formData.width} onChange={(e) => setFormData({ ...formData, width: e.target.value })} />
            <TextField label="Depth (cm)" value={formData.depth} onChange={(e) => setFormData({ ...formData, depth: e.target.value })} />
            <TextField label="Height (cm)" value={formData.height} onChange={(e) => setFormData({ ...formData, height: e.target.value })} />
          </Stack>
          <TextField label="Details" value={formData.details} onChange={(e) => setFormData({ ...formData, details: e.target.value })} multiline minRows={4} />

          {/* Cover */}
          <Typography variant="subtitle2" sx={{ mt: 1 }}>Cover</Typography>
          <input type="file" accept="image/*" ref={coverInputRef} onChange={(e) => handleCoverChange(e)} style={{ display: "none" }} id="cover-file-input" />
          <Stack direction="row" spacing={1} alignItems="center">
            {coverPreview && (
              <Box sx={{ position: "relative", width: 240, borderRadius: 2, overflow: "hidden", boxShadow: 1 }}>
                <Box sx={{ pt: "56.25%" }} />
                <img src={coverPreview} alt="cover" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                <IconButton size="small" onClick={() => handleRemoveCover()} sx={{ position: "absolute", top: 4, right: 4, bgcolor: "rgba(0,0,0,0.5)" }}>
                  <CloseIcon fontSize="small" sx={{ color: "white" }} />
                </IconButton>
              </Box>
            )}
            <Button variant="outlined" startIcon={<AddIcon />} onClick={() => coverInputRef.current?.click()}>{coverPreview ? "Change Cover" : "Add Cover"}</Button>
          </Stack>

          {/* Images */}
          <Typography variant="subtitle2">Gallery Images</Typography>
          <input type="file" accept="image/*" multiple ref={imagesInputRef} onChange={handleImagesChange} style={{ display: "none" }} id="images-file-input" />
          <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
            {imagesPreview.map((src, idx) => (
              <Box key={idx} sx={{ position: "relative", width: 160, borderRadius: 1, overflow: "hidden", boxShadow: 1 }}>
                <Box sx={{ pt: "56.25%" }} />
                <img src={src} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                <IconButton size="small" onClick={() => handleRemoveImage(idx)} sx={{ position: "absolute", top: 2, right: 2, bgcolor: "rgba(0,0,0,0.5)" }}>
                  <CloseIcon fontSize="small" sx={{ color: "white" }} />
                </IconButton>
              </Box>
            ))}
            <Box onClick={() => imagesInputRef.current?.click()} sx={{ cursor: "pointer", width: 160, borderRadius: 1, border: "2px dashed #ccc", display: "flex", justifyContent: "center", alignItems: "center", color: "gray" }}>
              <Box sx={{ pt: "56.25%", width: "100%", position: "relative" }}>
                <AddIcon fontSize="large" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
              </Box>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenForm(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={!coverPreview} sx={{ bgcolor: colors.accent, "&:hover": { bgcolor: "#b57b14" } }}>
            {isEditing ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
