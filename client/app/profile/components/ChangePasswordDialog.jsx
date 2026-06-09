'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useModalContext } from '../../../shared/hooks/useModalContext';

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
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
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

      setTimeout(() => {
        onClose();
      }, 1000);
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

  return (
    <Dialog
      open={open}
      onClose={() => {
        setFormError({});
        onClose();
      }}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: (theme) => ({
          bgcolor: theme.palette.background.paper,
          color: theme.palette.text.primary,
        }),
      }}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>เปลี่ยนรหัสผ่าน</DialogTitle>
      <DialogContent component="form" onSubmit={handleSubmit} sx={{ pt: 2 }}>
        <TextField
          label="รหัสผ่านเดิม"
          name="oldPassword"
          type="password"
          value={form.oldPassword}
          onChange={handleChange}
          fullWidth
          margin="normal"
          error={!!formError.oldPassword}
          helperText={formError.oldPassword}
        />
        <TextField
          label="รหัสผ่านใหม่"
          name="newPassword"
          type="password"
          value={form.newPassword}
          onChange={handleChange}
          fullWidth
          margin="normal"
          error={!!formError.newPassword}
          helperText={formError.newPassword}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={() => { setFormError({}); onClose(); }} disabled={isSubmitting}>
          ยกเลิก
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={isSubmitting}
          startIcon={isSubmitting && <CircularProgress size={20} />}
          sx={{ fontWeight: 600 }}
        >
          {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
