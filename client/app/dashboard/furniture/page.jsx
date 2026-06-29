"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import useModalContext from "@/shared/hooks/useModalContext";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { X } from "lucide-react";

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

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/furniture`, {
        headers: { Authorization: `Bearer ${session?.backendToken}` },
      });
      setItems(res.ok ? (await res.json()) : []);
    } catch {
      toast.error("Failed to load");
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
      toast.success("Deleted");
      fetchItems();
    } catch {
      toast.error("Failed to delete");
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
      toast.warning("Name required");
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
      toast.success(isEditing ? "Updated" : "Created");
      setOpenForm(false); fetchItems();
    } catch {
      toast.error("Failed to submit");
    } finally {
      hideLoading();
    }
  };

  const skeletons = Array.from({ length: 6 });

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
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
                    <button onClick={() => handleEdit(it)} className="flex items-center gap-1.5 px-3 py-2 min-h-[40px] text-xs text-[#cc8f2a] border border-[#cc8f2a]/40 rounded-lg hover:bg-[#cc8f2a]/10 transition-colors">
                      <EditIcon /> Edit
                    </button>
                    <button onClick={() => handleDelete(it.id)} className="flex items-center gap-1.5 px-3 py-2 min-h-[40px] text-xs text-rose-400 border border-rose-400/30 rounded-lg hover:bg-rose-400/10 transition-colors">
                      <TrashIcon /> Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={openForm} onOpenChange={(o) => !o && setOpenForm(false)}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Furniture" : "Add Furniture"}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="f-name">Name <span className="text-destructive">*</span></Label>
              <Input id="f-name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Type</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="f-price">Price (THB)</Label>
              <Input id="f-price" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
            </div>

            <div className="grid grid-cols-3 gap-2">
              {["width", "depth", "height"].map((k) => (
                <div key={k} className="flex flex-col gap-1.5">
                  <Label htmlFor={`f-${k}`}>{k.charAt(0).toUpperCase() + k.slice(1)} (cm)</Label>
                  <Input id={`f-${k}`} value={formData[k]} onChange={(e) => setFormData({ ...formData, [k]: e.target.value })} />
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="f-details">Details</Label>
              <Textarea id="f-details" value={formData.details} onChange={(e) => setFormData({ ...formData, details: e.target.value })} rows={3} />
            </div>

            {/* Cover */}
            <div className="flex flex-col gap-2">
              <Label>Cover Image</Label>
              <input type="file" accept="image/*" ref={coverInputRef} onChange={(e) => { const f = e.target.files?.[0]; setCoverPreview(f ? URL.createObjectURL(f) : null); }} className="hidden" />
              {coverPreview ? (
                <div className="relative w-48 rounded-lg overflow-hidden">
                  <img src={coverPreview} alt="cover" className="w-full aspect-video object-cover" />
                  <button type="button" onClick={() => { setCoverPreview(null); if (coverInputRef.current) coverInputRef.current.value = null; }} className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => coverInputRef.current?.click()} className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground border border-border rounded-lg hover:border-foreground transition-colors w-fit">
                  <PlusIcon /> Add Cover
                </button>
              )}
            </div>

            {/* Gallery */}
            <div className="flex flex-col gap-2">
              <Label>Gallery Images</Label>
              <input type="file" accept="image/*" multiple ref={imagesInputRef} onChange={handleImagesChange} className="hidden" />
              <div className="flex flex-wrap gap-2">
                {imagesPreview.map((src, idx) => (
                  <div key={idx} className="relative w-24 rounded-lg overflow-hidden">
                    <img src={src} alt="" className="w-full aspect-video object-cover" />
                    <button type="button" onClick={() => handleRemoveImage(idx)} className="absolute top-0.5 right-0.5 p-0.5 bg-black/60 rounded-full text-white">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => imagesInputRef.current?.click()} className="w-24 aspect-video rounded-lg border-2 border-dashed border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                  <PlusIcon />
                </button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpenForm(false)}>Cancel</Button>
            <Button type="button" onClick={handleSubmit}>{isEditing ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PlusIcon() { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>; }
function EditIcon() { return <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>; }
function TrashIcon() { return <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6M9 6V4h6v2" /></svg>; }
