"use client";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, InputLabel, Box, IconButton, Button, Stack
} from "@mui/material";
import { Add as AddIcon, Close as CloseIcon } from "@mui/icons-material";

export default function NewsFormDialog({
  open, onClose, onSubmit,
  formData, setFormData,
  coverPreview, setCoverPreview,
  imagesPreview, setImagesPreview,
  coverInputRef, imagesInputRef,
  onRemoveImage,
}) {
  const onCoverChange = (e) => {
    const file = e.target.files[0];
    setCoverPreview(file ? URL.createObjectURL(file) : null);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{formData?.id ? "Edit News" : "Add News"}</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
        <TextField label="Heading 1" value={formData.heading1} onChange={(e)=>setFormData({...formData, heading1: e.target.value})} required fullWidth />
        <TextField label="Heading 2" value={formData.heading2} onChange={(e)=>setFormData({...formData, heading2: e.target.value})} fullWidth />
        <TextField label="Body" value={formData.body} onChange={(e)=>setFormData({...formData, body: e.target.value})} fullWidth multiline minRows={4} />
        <TextField label="Video URL (embed)" value={formData.videoUrl} onChange={(e)=>setFormData({...formData, videoUrl: e.target.value})} fullWidth />

        <InputLabel shrink sx={{ mt: 2 }}>Cover Image</InputLabel>
        <input type="file" accept="image/*" ref={coverInputRef} onChange={onCoverChange} style={{ display:"none" }} />
        <Box sx={{ display:"flex", alignItems:"center", gap:1 }}>
          {coverPreview && (
            <Box sx={{ position:"relative", width: 240, borderRadius:2, overflow:"hidden", boxShadow:1 }}>
              <Box sx={{ pt: "56.25%" }} />
              <img src={coverPreview} alt="cover" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }} />
              <IconButton size="small" onClick={()=>setCoverPreview(null)} sx={{ position:"absolute", top:4, right:4, bgcolor:"rgba(0,0,0,0.5)" }}>
                <CloseIcon fontSize="small" sx={{ color:"#fff" }} />
              </IconButton>
            </Box>
          )}
          <Button variant="outlined" startIcon={<AddIcon />} onClick={()=>coverInputRef.current?.click()}>
            {coverPreview ? "Change Cover" : "Add Cover"}
          </Button>
        </Box>

        <InputLabel shrink sx={{ mt: 2 }}>Gallery Images</InputLabel>
        <input type="file" accept="image/*" multiple ref={imagesInputRef}
               onChange={(e)=>{ const files = Array.from(e.target.files); if(files.length) setImagesPreview(prev=>[...prev, ...files.map(f=>URL.createObjectURL(f))]); }}
               style={{ display:"none" }} />
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {imagesPreview.map((src, i)=>(
            <Box key={i} sx={{ position:"relative", width:160, borderRadius:1, overflow:"hidden", boxShadow:1 }}>
              <Box sx={{ pt: "56.25%" }} />
              <img src={src} alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }} />
              <IconButton size="small" onClick={()=>onRemoveImage(i)} sx={{ position:"absolute", top:2, right:2, bgcolor:"rgba(0,0,0,0.5)" }}>
                <CloseIcon fontSize="small" sx={{ color:"#fff" }} />
              </IconButton>
            </Box>
          ))}
          <Box onClick={()=>imagesInputRef.current?.click()}
               sx={{ cursor:"pointer", width:160, borderRadius:1, border:"2px dashed #666", display:"flex", alignItems:"center", justifyContent:"center", color:"#aaa" }}>
            <Box sx={{ pt:"56.25%", width:"100%", position:"relative" }}>
              <AddIcon fontSize="large" style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)" }} />
            </Box>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onSubmit} disabled={!coverPreview}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}
