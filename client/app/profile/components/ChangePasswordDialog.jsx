'use client';

import { useState, useEffect } from 'react';
import { useModalContext } from '../../../shared/hooks/useModalContext';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Loader2 } from "lucide-react";

export default function ChangePasswordDialog({ open, onClose, user, token }) {
  const { showModal, closeModal } = useModalContext();
  const [form, setForm] = useState({ oldPassword: '', newPassword: '' });
  const [formError, setFormError] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({ oldPassword: '', newPassword: '' });
      setFormError({});
    }
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFormError((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const errors = {};
    if (!form.oldPassword.trim()) errors.oldPassword = 'กรุณากรอกรหัสผ่านเดิม';
    if (!form.newPassword.trim()) errors.newPassword = 'กรุณากรอกรหัสผ่านใหม่';
    else if (form.newPassword.length < 6) errors.newPassword = 'รหัสใหม่ต้องอย่างน้อย 6 ตัวอักษร';
    setFormError(errors);
    return Object.keys(errors).length === 0;
  };

  const submitData = async () => {
    setIsSubmitting(true);
    const minDelay = 500;
    const startTime = Date.now();
    try {
      showModal('loading', { message: 'กำลังเปลี่ยนรหัสผ่าน...' });
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const elapsed = Date.now() - startTime;
      if (elapsed < minDelay) await new Promise((r) => setTimeout(r, minDelay - elapsed));
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'เกิดข้อผิดพลาด' }));
        throw new Error(err.message || 'เกิดข้อผิดพลาด');
      }
      closeModal();
      showModal('success', { message: 'เปลี่ยนรหัสผ่านสำเร็จ!' });
      setTimeout(() => { onClose(); }, 1000);
    } catch (error) {
      closeModal();
      showModal('error', { message: error.message || 'เกิดข้อผิดพลาด' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    showModal('confirm', {
      message: 'คุณแน่ใจหรือไม่ว่าต้องการเปลี่ยนรหัสผ่าน?',
      onConfirm: submitData,
    });
  };

  const handleClose = () => { setFormError({}); onClose(); };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-bold">เปลี่ยนรหัสผ่าน</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-1">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="oldPassword">รหัสผ่านเดิม</Label>
            <Input
              id="oldPassword"
              name="oldPassword"
              type="password"
              value={form.oldPassword}
              onChange={handleChange}
              className={formError.oldPassword ? "border-destructive" : ""}
            />
            {formError.oldPassword && <p className="text-sm text-destructive">{formError.oldPassword}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="newPassword">รหัสผ่านใหม่</Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              value={form.newPassword}
              onChange={handleChange}
              className={formError.newPassword ? "border-destructive" : ""}
            />
            {formError.newPassword && <p className="text-sm text-destructive">{formError.newPassword}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              ยกเลิก
            </Button>
            <Button type="submit" disabled={isSubmitting} className="font-semibold">
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />กำลังบันทึก...</>
              ) : "บันทึก"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
