"use client";

import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, InputLabel, Box, IconButton, Button, Stack
} from "@mui/material";
import { Add as AddIcon, Close as CloseIcon } from "@mui/icons-material";

export default function DesignFormDialog({
  open, onClose, onSubmit,
  formData, setFormData,
  coverPreview, setCoverPreview,
  imagesPreview, setImagesPreview,
  coverInputRef, imagesInputRef,
  onRemoveImage
}) {
  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    setCoverPreview(file ? URL.createObjectURL(file) : null);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{formData?.id ? "Edit Design" : "Add New Design"}</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
        <TextField
          label="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          fullWidth
          required
        />
        <TextField
          select
          label="Type"
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          fullWidth
          required
        >
          <MenuItem value="ARCHITECTURAL">ARCHITECTURAL</MenuItem>
          <MenuItem value="INTERIOR">INTERIOR</MenuItem>
        </TextField>

        <InputLabel shrink sx={{ mt: 2 }}>Cover Image</InputLabel>
        <input type="file" accept="image/*" ref={coverInputRef} onChange={handleCoverChange} style={{ display: "none" }} />
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
          {coverPreview ? (
            <Box sx={{ position: "relative", width: 240, borderRadius: 2, overflow: "hidden", boxShadow: 1 }}>
              <Box sx={{ pt: "56.25%" }} />
              <img src={coverPreview} alt="Cover Preview" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
              <IconButton
                size="small"
                onClick={() => setCoverPreview(null)}
                sx={{ position: "absolute", top: 4, right: 4, bgcolor: "rgba(0,0,0,0.5)", "&:hover": { bgcolor: "rgba(0,0,0,0.7)" } }}
              >
                <CloseIcon fontSize="small" sx={{ color: "white" }} />
              </IconButton>
            </Box>
          ) : null}

          <Button variant="outlined" startIcon={<AddIcon />} onClick={() => coverInputRef.current?.click()} sx={{ height: 40 }}>
            {coverPreview ? "Change Cover" : "Add Cover"}
          </Button>
        </Box>

        <InputLabel shrink sx={{ mt: 2 }}>Additional Images</InputLabel>
        <input
          type="file"
          accept="image/*"
          multiple
          ref={imagesInputRef}
          onChange={(e) => {
            const files = Array.from(e.target.files);
            if (files.length) setImagesPreview((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
          }}
          style={{ display: "none" }}
        />
        <Stack direction="row" spacing={1} mt={1} flexWrap="wrap" alignItems="center">
          {imagesPreview.map((src, i) => (
            <Box key={i} sx={{ position: "relative", width: 160, borderRadius: 1, overflow: "hidden", boxShadow: 1 }}>
              <Box sx={{ pt: "56.25%" }} />
              <img src={src} alt={`Preview ${i + 1}`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
              <IconButton
                size="small"
                onClick={() => onRemoveImage(i)}
                sx={{ position: "absolute", top: 2, right: 2, bgcolor: "rgba(0,0,0,0.5)", "&:hover": { bgcolor: "rgba(0,0,0,0.7)" } }}
              >
                <CloseIcon fontSize="small" sx={{ color: "white" }} />
              </IconButton>
            </Box>
          ))}

          <Box
            onClick={() => imagesInputRef.current?.click()}
            sx={{
              cursor: "pointer",
              width: 160,
              borderRadius: 1,
              border: "2px dashed #ccc",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "gray",
              "&:hover": { borderColor: "primary.main", color: "primary.main" },
            }}
          >
            <Box sx={{ pt: "56.25%", width: "100%", position: "relative" }}>
              <AddIcon fontSize="large" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
            </Box>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onSubmit} disabled={!coverPreview}>
          {formData?.id ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
