"use client";

import React, { useEffect, useRef, useState } from "react";
import { Snackbar, Alert } from "@mui/material";
import useModalContext from "@/shared/hooks/useModalContext";
import ProjectSection from "./components/ProjectSection";
import ProjectFormDialog from "./components/ProjectFormDialog";

const COLORS = { bg: "#0a0a0a", text: "#FFFFFF", accent: "#cc8f2a" };

export default function DashboardProjects() {
  const [loading, setLoading] = useState(true);
  const [REBUILD, setREBUILD] = useState([]);
  const [RENOVATE, setRENOVATE] = useState([]);
  const [REDESIGN, setREDESIGN] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: "", type: "REBUILD", details: "", areaSize: "", coverUrl: "", images: [] });
  const [coverPreview, setCoverPreview] = useState(null);
  const [imagesPreview, setImagesPreview] = useState([]);
  const [deleteImageIds, setDeleteImageIds] = useState(new Set());
  const coverInputRef = useRef(null);
  const imagesInputRef = useRef(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const { showLoading, hideLoading, confirm } = useModalContext();

  const splitGroups = (arr) => {
    setREBUILD(arr.filter((p) => p.type === "REBUILD"));
    setRENOVATE(arr.filter((p) => p.type === "RENOVATE"));
    setREDESIGN(arr.filter((p) => p.type === "REDESIGN"));
  };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const { getSession } = await import("next-auth/react");
      const session = await getSession();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects`, {
        headers: { Authorization: `Bearer ${session?.backendToken}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      splitGroups(data || []);
    } catch {
      setSnackbar({ open: true, message: "Failed to load projects", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const resetFileInputs = () => {
    if (coverInputRef.current) coverInputRef.current.value = null;
    if (imagesInputRef.current) imagesInputRef.current.value = null;
  };

  const handleOpenAdd = () => {
    setFormData({ id: null, name: "", type: "REBUILD", details: "", areaSize: "", coverUrl: "", images: [] });
    setCoverPreview(null); setImagesPreview([]); setDeleteImageIds(new Set());
    setIsEditing(false); setOpenForm(true); resetFileInputs();
  };

  const handleEdit = (item) => {
    setFormData({ id: item.id, name: item.name || "", type: item.type || "REBUILD", details: item.details || "", areaSize: item.areaSize ?? "", coverUrl: item.coverUrl || "", images: item.images || [] });
    setCoverPreview(item.coverUrl || null);
    setImagesPreview(item.images?.map((img) => img.imageUrl) || []);
    setDeleteImageIds(new Set()); setIsEditing(true); setOpenForm(true); resetFileInputs();
  };

  const handleDelete = async (id) => {
    const ok = await confirm({ title: "Delete project?", message: "การลบจะไม่สามารถย้อนกลับได้", confirmText: "Delete", cancelText: "Cancel" });
    if (!ok) return;
    showLoading("Deleting...");
    try {
      const { getSession } = await import("next-auth/react");
      const session = await getSession();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session?.backendToken}` },
      });
      if (!res.ok) throw new Error();
      setSnackbar({ open: true, message: "Deleted", severity: "success" });
      fetchProjects();
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
    form.append("details", formData.details || "");
    if (formData.areaSize !== "") form.append("areaSize", String(formData.areaSize));
    if (coverInputRef.current?.files[0]) form.append("cover", coverInputRef.current.files[0]);
    if (imagesInputRef.current?.files?.length)
      Array.from(imagesInputRef.current.files).forEach((f) => form.append("images", f));
    if (deleteImageIds.size) form.append("deleteImageIds", Array.from(deleteImageIds).join(","));

    showLoading(isEditing ? "Updating..." : "Creating...");
    const method = isEditing ? "PUT" : "POST";
    const url = isEditing
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/projects/${formData.id}`
      : `${process.env.NEXT_PUBLIC_API_URL}/api/projects`;
    try {
      const { getSession } = await import("next-auth/react");
      const session = await getSession();
      const res = await fetch(url, { method, headers: { Authorization: `Bearer ${session?.backendToken}` }, body: form });
      if (!res.ok) throw new Error();
      setSnackbar({ open: true, message: isEditing ? "Updated" : "Created", severity: "success" });
      setOpenForm(false); fetchProjects();
    } catch {
      setSnackbar({ open: true, message: "Failed to submit", severity: "error" });
    } finally {
      hideLoading();
    }
  };

  const onRemoveImage = (i) => {
    const url = imagesPreview[i];
    const existing = formData.images.find((img) => img.imageUrl === url);
    if (existing) setDeleteImageIds((prev) => new Set(prev).add(existing.id));
    setImagesPreview((prev) => prev.filter((_, idx) => idx !== i));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-xl font-semibold text-white">Project Management</h1>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#cc8f2a] text-black rounded-lg hover:bg-[#b57b14] transition-colors"
        >
          <PlusIcon /> Add Project
        </button>
      </div>

      <ProjectSection title="REBUILD" items={REBUILD} loading={loading} onEdit={handleEdit} onDelete={handleDelete} colors={COLORS} />
      <div className="my-8" />
      <ProjectSection title="RENOVATE" items={RENOVATE} loading={loading} onEdit={handleEdit} onDelete={handleDelete} colors={COLORS} />
      <div className="my-8" />
      <ProjectSection title="REDESIGN" items={REDESIGN} loading={loading} onEdit={handleEdit} onDelete={handleDelete} colors={COLORS} />

      <ProjectFormDialog
        open={openForm} onClose={() => setOpenForm(false)} onSubmit={handleSubmit}
        formData={formData} setFormData={setFormData}
        coverPreview={coverPreview} setCoverPreview={setCoverPreview}
        imagesPreview={imagesPreview} setImagesPreview={setImagesPreview}
        coverInputRef={coverInputRef} imagesInputRef={imagesInputRef}
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
