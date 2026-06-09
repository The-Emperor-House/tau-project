"use client";

import { useEffect, useRef, useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, IconButton, Snackbar, Alert } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { useSession } from "next-auth/react";
import useModalContext from "@/shared/hooks/useModalContext";

const TYPES = ["BUILT_IN", "LOOSE", "CUSTOM"];

export default function DashboardFurniture() {
  const { data: session } = useSession();
  const { showLoading, hideLoading, confirm } = useModalContext();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: "", type: "BUILT_IN", details: "", price: "", width: "", depth: "", height: "", images: [], coverUrl: "" });
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
      setItems(res.ok ? (await res.json()) : []);
    } catch {
      setSnackbar({ open: true, message: "Failed to load", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, [session?.backendToken]); // eslint-disable-line

  const resetFiles = () => {
    if (coverInputRef.current) coverInputRef.current.value = null;
    if (imagesInputRef.current) imagesInputRef.current.value = null;
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({ id: null, name: "", type: "BUILT_IN", details: "", price: "", width: "", depth: "", height: "", images: [], coverUrl: "" });
    setCoverPreview(null); setImagesPreview([]); setDeleteImageIds(new Set());
    setOpenForm(true); resetFiles();
  };

  const handleEdit = (it) => {
    setIsEditing(true);
    setFormData({ id: it.id, name: it.name, type: it.type, details: it.details || "", price: it.price ?? "", width: it.width ?? "", depth: it.depth ?? "", height: it.height ?? "", images: it.images || [], coverUrl: it.coverUrl || "" });
    setCoverPreview(it.coverUrl || null);
    setImagesPreview(it.images?.map((x) => x.imageUrl) || []);
    setDeleteImageIds(new Set()); setOpenForm(true); resetFiles();
  };

  const handleDelete = async (id) => {
    const ok = await confirm({ title: "Delete furniture?", message: "ต้องการลบรายการนี้หรือไม่", confirmText: "Delete", cancelText: "Cancel" });
    if (!ok) return;
    showLoading("Deleting...");
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
    } finally {
      hideLoading();
    }
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length) setImagesPreview((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
  };

  const handleRemoveImage = (index) => {
    const url = imagesPreview[index];
    const ex = formData.images.find((im) => im.imageUrl === url);
    if (ex) setDeleteImageIds((prev) => new Set(prev).add(ex.id));
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

    showLoading(isEditing ? "Updating..." : "Creating...");
    const method = isEditing ? "PUT" : "POST";
    const url = isEditing
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/furniture/${formData.id}`
      : `${process.env.NEXT_PUBLIC_API_URL}/api/furniture`;
    try {
      const res = await fetch(url, { method, headers: { Authorization: `Bearer ${session?.backendToken}` }, body: form });
      if (!res.ok) throw new Error();
      setSnackbar({ open: true, message: isEditing ? "Updated" : "Created", severity: "success" });
      setOpenForm(false); fetchItems();
    } catch {
      setSnackbar({ open: true, message: "Failed to submit", severity: "error" });
    } finally {
      hideLoading();
    }
  };

  const skeletons = Array.from({ length: 6 });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-xl font-semibold text-white">Furniture</h1>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#cc8f2a] text-black rounded-lg hover:bg-[#b57b14] transition-colors"
        >
          <PlusIcon /> Add Furniture
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(loading ? skeletons : items).map((it, i) => (
          <div key={it?.id ?? i} className="rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 flex flex-col">
            <div className="relative aspect-video bg-neutral-800">
              {loading
                ? <div className="absolute inset-0 bg-neutral-800 animate-pulse" />
                : it.coverUrl && <img src={it.coverUrl} alt={it.name} className="absolute inset-0 w-full h-full object-cover" />
              }
            </div>
            <div className="p-4 flex flex-col flex-1">
              {loading ? (
                <div className="space-y-2">
                  <div className="h-4 bg-neutral-800 rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-neutral-800 rounded animate-pulse w-1/2" />
                </div>
              ) : (
                <>
                  <p className="text-sm font-semibold text-white">{it.name}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">{it.type}</p>
                  {typeof it.price === "number" && (
                    <p className="text-sm text-[#cc8f2a] mt-1">{it.price.toLocaleString("th-TH")} บาท</p>
                  )}
                  <div className="flex gap-2 mt-auto pt-4">
                    <button onClick={() => handleEdit(it)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#cc8f2a] border border-[#cc8f2a]/40 rounded-lg hover:bg-[#cc8f2a]/10 transition-colors">
                      <EditIcon /> Edit
                    </button>
                    <button onClick={() => handleDelete(it.id)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-400 border border-rose-400/30 rounded-lg hover:bg-rose-400/10 transition-colors">
                      <TrashIcon /> Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Form Dialog */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ bgcolor: "#111", color: "#fff", borderBottom: "1px solid #262626" }}>
          {isEditing ? "Edit Furniture" : "Add Furniture"}
        </DialogTitle>
        <DialogContent sx={{ bgcolor: "#111", color: "#e5e5e5", display: "grid", gap: 2, pt: "20px !important" }}>
          <TextField label="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} fullWidth required InputLabelProps={{ style: { color: "#737373" } }} inputProps={{ style: { color: "#fff" } }} sx={{ "& .MuiOutlinedInput-root": { "& fieldset": { borderColor: "#404040" }, "&:hover fieldset": { borderColor: "#737373" }, "&.Mui-focused fieldset": { borderColor: "#cc8f2a" } } }} />
          <TextField select label="Type" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} fullWidth InputLabelProps={{ style: { color: "#737373" } }} inputProps={{ style: { color: "#fff" } }} sx={{ "& .MuiOutlinedInput-root": { "& fieldset": { borderColor: "#404040" }, "&.Mui-focused fieldset": { borderColor: "#cc8f2a" } } }}>
            {TYPES.map((t) => <MenuItem key={t} value={t} sx={{ bgcolor: "#1a1a1a", color: "#fff", "&:hover": { bgcolor: "#262626" } }}>{t}</MenuItem>)}
          </TextField>
          <TextField label="Price (THB)" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} InputLabelProps={{ style: { color: "#737373" } }} inputProps={{ style: { color: "#fff" } }} sx={{ "& .MuiOutlinedInput-root": { "& fieldset": { borderColor: "#404040" }, "&.Mui-focused fieldset": { borderColor: "#cc8f2a" } } }} />
          <div className="grid grid-cols-3 gap-2">
            {["width", "depth", "height"].map((k) => (
              <TextField key={k} label={`${k.charAt(0).toUpperCase() + k.slice(1)} (cm)`} value={formData[k]} onChange={(e) => setFormData({ ...formData, [k]: e.target.value })} InputLabelProps={{ style: { color: "#737373" } }} inputProps={{ style: { color: "#fff" } }} sx={{ "& .MuiOutlinedInput-root": { "& fieldset": { borderColor: "#404040" }, "&.Mui-focused fieldset": { borderColor: "#cc8f2a" } } }} />
            ))}
          </div>
          <TextField label="Details" value={formData.details} onChange={(e) => setFormData({ ...formData, details: e.target.value })} multiline minRows={3} InputLabelProps={{ style: { color: "#737373" } }} inputProps={{ style: { color: "#fff" } }} sx={{ "& .MuiOutlinedInput-root": { "& fieldset": { borderColor: "#404040" }, "&.Mui-focused fieldset": { borderColor: "#cc8f2a" } } }} />

          {/* Cover */}
          <div>
            <p className="text-sm text-neutral-400 mb-2">Cover Image</p>
            <input type="file" accept="image/*" ref={coverInputRef} onChange={(e) => { const f = e.target.files?.[0]; setCoverPreview(f ? URL.createObjectURL(f) : null); }} style={{ display: "none" }} />
            {coverPreview ? (
              <div className="relative w-48 rounded-lg overflow-hidden">
                <img src={coverPreview} alt="cover" className="w-full aspect-video object-cover" />
                <button onClick={() => { setCoverPreview(null); if (coverInputRef.current) coverInputRef.current.value = null; }} className="absolute top-1 right-1 p-1 bg-black/60 rounded-full">
                  <CloseIcon sx={{ fontSize: 14, color: "#fff" }} />
                </button>
              </div>
            ) : (
              <button onClick={() => coverInputRef.current?.click()} className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-400 border border-neutral-700 rounded-lg hover:border-neutral-500 transition-colors">
                <PlusIcon /> Add Cover
              </button>
            )}
          </div>

          {/* Gallery */}
          <div>
            <p className="text-sm text-neutral-400 mb-2">Gallery Images</p>
            <input type="file" accept="image/*" multiple ref={imagesInputRef} onChange={handleImagesChange} style={{ display: "none" }} />
            <div className="flex flex-wrap gap-2">
              {imagesPreview.map((src, idx) => (
                <div key={idx} className="relative w-24 rounded-lg overflow-hidden">
                  <img src={src} alt="" className="w-full aspect-video object-cover" />
                  <button onClick={() => handleRemoveImage(idx)} className="absolute top-0.5 right-0.5 p-0.5 bg-black/60 rounded-full">
                    <CloseIcon sx={{ fontSize: 12, color: "#fff" }} />
                  </button>
                </div>
              ))}
              <button onClick={() => imagesInputRef.current?.click()} className="w-24 aspect-video rounded-lg border-2 border-dashed border-neutral-700 flex items-center justify-center text-neutral-600 hover:border-neutral-500 transition-colors">
                <PlusIcon />
              </button>
            </div>
          </div>
        </DialogContent>
        <DialogActions sx={{ bgcolor: "#111", borderTop: "1px solid #262626", px: 3, py: 2 }}>
          <button onClick={() => setOpenForm(false)} className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors">Cancel</button>
          <button onClick={handleSubmit} className="px-4 py-2 text-sm font-medium bg-[#cc8f2a] text-black rounded-lg hover:bg-[#b57b14] disabled:opacity-50 transition-colors">
            {isEditing ? "Update" : "Create"}
          </button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

function PlusIcon() { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>; }
function EditIcon() { return <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>; }
function TrashIcon() { return <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6M9 6V4h6v2" /></svg>; }
