"use client";

import React, { useEffect, useRef, useState } from "react";
import { Snackbar, Alert } from "@mui/material";
import useModalContext from "@/shared/hooks/useModalContext";
import NewsFormDialog from "./components/NewsFormDialog";

export default function DashboardNews() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ id: null, heading1: "", heading2: "", body: "", videoUrl: "", coverUrl: "", images: [] });
  const [coverPreview, setCoverPreview] = useState(null);
  const [imagesPreview, setImagesPreview] = useState([]);
  const [deleteImageIds, setDeleteImageIds] = useState(new Set());
  const coverInputRef = useRef(null);
  const imagesInputRef = useRef(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
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
      setSnackbar({ open: true, message: "Failed to load news", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNews(); }, []);

  const resetFiles = () => {
    if (coverInputRef.current) coverInputRef.current.value = null;
    if (imagesInputRef.current) imagesInputRef.current.value = null;
  };

  const openAdd = () => {
    setFormData({ id: null, heading1: "", heading2: "", body: "", videoUrl: "", coverUrl: "", images: [] });
    setCoverPreview(null); setImagesPreview([]); setDeleteImageIds(new Set());
    setIsEditing(false); setOpenForm(true); resetFiles();
  };

  const onEdit = (item) => {
    setFormData({ id: item.id, heading1: item.heading1, heading2: item.heading2 || "", body: item.body || "", videoUrl: item.videoUrl || "", coverUrl: item.coverUrl || "", images: item.images || [] });
    setCoverPreview(item.coverUrl || null);
    setImagesPreview(item.images?.map((i) => i.imageUrl) || []);
    setDeleteImageIds(new Set()); setIsEditing(true); setOpenForm(true); resetFiles();
  };

  const onRemoveImage = (i) => {
    const url = imagesPreview[i];
    const existing = formData.images.find((img) => img.imageUrl === url);
    if (existing) setDeleteImageIds((prev) => new Set(prev).add(existing.id));
    setImagesPreview((prev) => prev.filter((_, idx) => idx !== i));
  };

  const onDelete = async (id) => {
    const ok = await confirm({ title: "Delete news?", message: "ต้องการลบบทความนี้หรือไม่", confirmText: "Delete", cancelText: "Cancel" });
    if (!ok) return;
    showLoading("Deleting...");
    try {
      const { getSession } = await import("next-auth/react");
      const session = await getSession();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/news/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session?.backendToken}` },
      });
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
      setSnackbar({ open: true, message: "Heading 1 is required", severity: "warning" });
      return;
    }
    const fd = new FormData();
    fd.append("heading1", formData.heading1);
    if (formData.heading2) fd.append("heading2", formData.heading2);
    if (formData.body) fd.append("body", formData.body);
    if (formData.videoUrl) fd.append("videoUrl", formData.videoUrl);
    if (coverInputRef.current?.files[0]) fd.append("cover", coverInputRef.current.files[0]);
    if (imagesInputRef.current?.files?.length)
      Array.from(imagesInputRef.current.files).forEach((f) => fd.append("images", f));
    if (deleteImageIds.size) fd.append("deleteImageIds", Array.from(deleteImageIds).join(","));

    showLoading(isEditing ? "Updating..." : "Creating...");
    const method = isEditing ? "PUT" : "POST";
    const url = isEditing
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/news/${formData.id}`
      : `${process.env.NEXT_PUBLIC_API_URL}/api/news`;
    try {
      const { getSession } = await import("next-auth/react");
      const session = await getSession();
      const res = await fetch(url, { method, headers: { Authorization: `Bearer ${session?.backendToken}` }, body: fd });
      if (!res.ok) throw new Error();
      setSnackbar({ open: true, message: isEditing ? "Updated" : "Created", severity: "success" });
      setOpenForm(false); fetchNews();
    } catch {
      setSnackbar({ open: true, message: "Submit failed", severity: "error" });
    } finally {
      hideLoading();
    }
  };

  const skeletons = Array.from({ length: 6 });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-xl font-semibold text-white">News & Events</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#cc8f2a] text-black rounded-lg hover:bg-[#b57b14] transition-colors"
        >
          <PlusIcon /> Add News
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(loading ? skeletons : news).map((it, i) => (
          <div key={it?.id ?? i} className="rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 flex flex-col">
            {/* Cover */}
            <div className="relative aspect-video bg-neutral-800">
              {!loading && it.coverUrl && (
                <img src={it.coverUrl} alt={it.heading1} className="absolute inset-0 w-full h-full object-cover" />
              )}
              {loading && <div className="absolute inset-0 bg-neutral-800 animate-pulse" />}
            </div>

            <div className="p-4 flex flex-col flex-1">
              {loading ? (
                <div className="space-y-2">
                  <div className="h-4 bg-neutral-800 rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-neutral-800 rounded animate-pulse w-1/2" />
                </div>
              ) : (
                <>
                  <p className="text-sm font-semibold text-white line-clamp-2 mb-1">{it.heading1}</p>
                  {it.heading2 && <p className="text-xs text-neutral-400 line-clamp-2">{it.heading2}</p>}
                  <div className="flex gap-2 mt-auto pt-4">
                    <button
                      onClick={() => onEdit(it)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#cc8f2a] border border-[#cc8f2a]/40 rounded-lg hover:bg-[#cc8f2a]/10 transition-colors"
                    >
                      <EditIcon /> Edit
                    </button>
                    <button
                      onClick={() => onDelete(it.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-400 border border-rose-400/30 rounded-lg hover:bg-rose-400/10 transition-colors"
                    >
                      <TrashIcon /> Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

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

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

function PlusIcon() { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>; }
function EditIcon() { return <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>; }
function TrashIcon() { return <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6M9 6V4h6v2" /></svg>; }
