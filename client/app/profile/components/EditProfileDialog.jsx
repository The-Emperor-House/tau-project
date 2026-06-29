"use client";

import { useState, useEffect } from "react";
import { useModalContext } from "../../../shared/hooks/useModalContext";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/shared/components/ui/select";

export default function EditProfileDialog({ open, onClose, user, token, onUpdated }) {
  const { showModal, closeModal } = useModalContext();
  const [form, setForm] = useState({ name: "", email: "", role: "USER" });
  const [formError, setFormError] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && user) {
      setForm({ name: user.name || "", email: user.email || "", role: user.role || "USER" });
      setFormError({});
    }
  }, [open, user]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFormError((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const validateForm = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = "กรุณากรอกชื่อ";
    if (!form.email.trim()) errors.email = "กรุณากรอกอีเมล";
    else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(form.email))
      errors.email = "รูปแบบอีเมลไม่ถูกต้อง";
    if (!form.role) errors.role = "กรุณาเลือกบทบาท";
    setFormError(errors);
    return Object.keys(errors).length === 0;
  };

  const submitData = async () => {
    const startTime = Date.now();
    setLoading(true);
    try {
      showModal("loading", { message: "กำลังอัปเดตข้อมูล..." });
      const userId = user?.userId || user?.id;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });

      console.log("Response Data:", form);

      const elapsed = Date.now() - startTime;
      const minDelay = 500;
      if (elapsed < minDelay) await new Promise((r) => setTimeout(r, minDelay - elapsed));

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "เกิดข้อผิดพลาด" }));
        throw new Error(err.message || "เกิดข้อผิดพลาด");
      }

      const updatedUser = await res.json();
      closeModal();
      showModal("success", { message: "อัปเดตข้อมูลสำเร็จ!" });
      setTimeout(() => { onUpdated(updatedUser); onClose(); }, 1500);
    } catch (error) {
      closeModal();
      showModal("error", { message: error.message || "เกิดข้อผิดพลาด" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitWithConfirm = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    showModal("confirm", {
      message: "คุณแน่ใจหรือไม่ว่าต้องการบันทึกการเปลี่ยนแปลง?",
      onConfirm: submitData,
    });
  };

  const handleClose = () => { setFormError({}); onClose(); };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-semibold">แก้ไขโปรไฟล์</DialogTitle>
        </DialogHeader>

        <form id="edit-profile-form" onSubmit={handleSubmitWithConfirm} className="flex flex-col gap-4 mt-1">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">ชื่อ</Label>
            <Input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              className={formError.name ? "border-destructive" : ""}
            />
            {formError.name && <p className="text-sm text-destructive">{formError.name}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">อีเมล</Label>
            <Input
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className={formError.email ? "border-destructive" : ""}
            />
            {formError.email && <p className="text-sm text-destructive">{formError.email}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>บทบาท</Label>
            <Select
              value={form.role}
              onValueChange={(v) => { setForm((p) => ({ ...p, role: v })); setFormError((p) => ({ ...p, role: "" })); }}
            >
              <SelectTrigger className={formError.role ? "border-destructive" : ""}>
                <SelectValue placeholder="เลือกบทบาท" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">ผู้ใช้</SelectItem>
                <SelectItem value="ADMIN">ผู้ดูแลระบบ</SelectItem>
                <SelectItem value="SUPER_ADMIN">ผู้ดูแลระบบสูงสุด</SelectItem>
              </SelectContent>
            </Select>
            {formError.role && <p className="text-sm text-destructive">{formError.role}</p>}
          </div>

          <DialogFooter className="mt-2">
            <Button type="button" variant="outline" onClick={handleClose}>ยกเลิก</Button>
            <Button type="submit" disabled={loading} className="font-semibold">บันทึก</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
