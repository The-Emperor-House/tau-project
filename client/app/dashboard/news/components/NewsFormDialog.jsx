"use client";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Plus, X } from "lucide-react";

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
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{formData?.id ? "Edit News" : "Add News"}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-1">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="heading1">Heading 1 <span className="text-destructive">*</span></Label>
            <Input
              id="heading1"
              value={formData.heading1}
              onChange={(e) => setFormData({ ...formData, heading1: e.target.value })}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="heading2">Heading 2</Label>
            <Input
              id="heading2"
              value={formData.heading2}
              onChange={(e) => setFormData({ ...formData, heading2: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="body">Body</Label>
            <Textarea
              id="body"
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              rows={4}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="videoUrl">Video URL (embed)</Label>
            <Input
              id="videoUrl"
              value={formData.videoUrl}
              onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
            />
          </div>

          {/* Cover Image */}
          <div className="flex flex-col gap-2">
            <Label>Cover Image</Label>
            <input type="file" accept="image/*" ref={coverInputRef} onChange={onCoverChange} className="hidden" />
            <div className="flex flex-wrap items-center gap-2">
              {coverPreview && (
                <div className="relative w-full sm:w-60 rounded-lg overflow-hidden shadow">
                  <div className="aspect-video relative">
                    <img src={coverPreview} alt="cover" className="absolute inset-0 w-full h-full object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setCoverPreview(null)}
                    className="absolute top-1 right-1 bg-black/50 hover:bg-black/70 rounded p-0.5 text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <Button type="button" variant="outline" onClick={() => coverInputRef.current?.click()}>
                <Plus className="w-4 h-4 mr-1" />
                {coverPreview ? "Change Cover" : "Add Cover"}
              </Button>
            </div>
          </div>

          {/* Gallery Images */}
          <div className="flex flex-col gap-2">
            <Label>Gallery Images</Label>
            <input
              type="file"
              accept="image/*"
              multiple
              ref={imagesInputRef}
              onChange={(e) => {
                const files = Array.from(e.target.files);
                if (files.length) setImagesPreview((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
              }}
              className="hidden"
            />
            <div className="flex flex-wrap gap-2">
              {imagesPreview.map((src, i) => (
                <div key={i} className="relative w-40 rounded overflow-hidden shadow">
                  <div className="aspect-video relative">
                    <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveImage(i)}
                    className="absolute top-0.5 right-0.5 bg-black/50 hover:bg-black/70 rounded p-0.5 text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => imagesInputRef.current?.click()}
                className="w-40 aspect-video rounded border-2 border-dashed border-neutral-400 hover:border-primary hover:text-primary text-neutral-400 flex items-center justify-center transition-colors"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="button" onClick={onSubmit} disabled={!coverPreview}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
