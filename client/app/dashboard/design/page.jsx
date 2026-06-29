"use client";

import React, { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import SectionBlock from "./components/SectionBlock";
import DesignFormDialog from "./components/DesignFormDialog";
import useModalContext from "@/shared/hooks/useModalContext";

const COLORS = { bg: "#0a0a0a", text: "#FFFFFF", accent: "#cc8f2a" };

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
  const { showLoading, hideLoading, confirm } = useModalContext();

  const fetchDesigns = async () => {
    setLoading(true);
    try {
      const { getSession } = await import("next-auth/react");
      const session = await getSession();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/designs`, {
        headers: { Authorization: `Bearer ${session?.backendToken}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setArchitectural(data.filter((d) => d.type === "ARCHITECTURAL"));
      setInterior(data.filter((d) => d.type === "INTERIOR"));
    } catch {
      toast.error("Failed to load designs");
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
    setCoverPreview(null); setImagesPreview([]); setDeleteImageIds(new Set());
    setIsEditing(false); setOpenForm(true); resetFileInputs();
  };

  const handleEdit = (item) => {
    setFormData({ id: item.id, name: item.name, type: item.type, coverUrl: item.coverUrl || "", images: item.images || [] });
    setCoverPreview(item.coverUrl || null);
    setImagesPreview(item.images?.map((img) => img.imageUrl) || []);
    setDeleteImageIds(new Set()); setIsEditing(true); setOpenForm(true); resetFileInputs();
  };

  const handleDelete = async (id) => {
    const ok = await confirm({ title: "Delete design?", message: "การลบจะไม่สามารถย้อนกลับได้", confirmText: "Delete", cancelText: "Cancel" });
    if (!ok) return;
    showLoading("Deleting...");
    try {
      const { getSession } = await import("next-auth/react");
      const session = await getSession();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/designs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session?.backendToken}` },
      });
      if (!res.ok) throw new Error();
      toast.success("Deleted");
      fetchDesigns();
    } catch {
      toast.error("Failed to delete");
    } finally {
      hideLoading();
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.warning("Name is required");
      return;
    }
    const form = new FormData();
    form.append("name", formData.name);
    form.append("type", formData.type);
    if (coverInputRef.current?.files[0]) form.append("cover", coverInputRef.current.files[0]);
    if (imagesInputRef.current?.files?.length)
      Array.from(imagesInputRef.current.files).forEach((f) => form.append("images", f));
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
      toast.success(isEditing ? "Updated" : "Created");
      setOpenForm(false); fetchDesigns();
    } catch {
      toast.error("Failed to submit");
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
    <div className="p-6 max-w-[1200px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-xl font-semibold text-white">Design Management</h1>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#cc8f2a] text-black rounded-lg hover:bg-[#b57b14] transition-colors"
        >
          <PlusIcon /> Add Design
        </button>
      </div>

      <SectionBlock title="Architectural Design" items={architectural} loading={loading} onEdit={handleEdit} onDelete={handleDelete} colors={COLORS} />
      <div className="my-8" />
      <SectionBlock title="Interior Design" items={interior} loading={loading} onEdit={handleEdit} onDelete={handleDelete} colors={COLORS} />

      <DesignFormDialog
        open={openForm} onClose={() => setOpenForm(false)} onSubmit={handleSubmit}
        formData={formData} setFormData={setFormData}
        coverPreview={coverPreview} setCoverPreview={setCoverPreview}
        imagesPreview={imagesPreview} setImagesPreview={setImagesPreview}
        coverInputRef={coverInputRef} imagesInputRef={imagesInputRef}
        onRemoveImage={onRemoveImage}
      />

    </div>
  );
}

function PlusIcon() { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>; }
