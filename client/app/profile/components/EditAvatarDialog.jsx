"use client";

import { useState } from "react";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/components/ui/avatar";
import { Loader2, Camera } from "lucide-react";

export default function EditAvatarDialog({ open, onClose, user, token, onUpdated }) {
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user.avatarUrl || "");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!avatarFile) {
      alert("กรุณาเลือกไฟล์รูปก่อน");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", avatarFile);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/avatar/me`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      console.log("Response status:", res.status);
      if (!res.ok) throw new Error("อัปเดตข้อมูลไม่สำเร็จ");
      const data = await res.json();
      onUpdated(data.user);
      onClose();
    } catch (err) {
      console.error("🔥 Update avatar error:", err);
      alert("เกิดข้อผิดพลาดในการอัปเดตรูป");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xs">
        <DialogHeader>
          <DialogTitle>แก้ไขรูปโปรไฟล์</DialogTitle>
        </DialogHeader>

        <div className="flex justify-center my-4">
          <div className="relative">
            <Avatar className="w-28 h-28">
              <AvatarImage
                src={avatarPreview || undefined}
                alt={user.name || "User"}
                onError={(e) => { e.target.onerror = null; e.target.src = ""; }}
              />
              <AvatarFallback className="text-4xl">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>

            <label className="absolute bottom-0 right-0 bg-background rounded-full p-1.5 shadow-md cursor-pointer hover:bg-muted transition-colors">
              <Camera className="w-4 h-4" />
              <input hidden type="file" accept="image/*" onChange={handleFileChange} />
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
