"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Select,
  MenuItem,
} from "@mui/material";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import FormHelperText from "@mui/material/FormHelperText";
import { useState, useEffect } from "react";
import { useModalContext } from "../../../shared/hooks/useModalContext";

export default function EditProfileDialog({
  open,
  onClose,
  user,
  token,
  onUpdated,
}) {
  const { showModal, closeModal } = useModalContext();
  const [form, setForm] = useState({ name: "", email: "", role: "USER" });
  const [formError, setFormError] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "USER",
      });
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
    if (!form.role) errors.role = "กรุณาเลือกบทบาท";
    else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(form.email))
      errors.email = "รูปแบบอีเมลไม่ถูกต้อง";
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
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        }
      );

      console.log("Response Data:", form);

      const elapsed = Date.now() - startTime;
      const minDelay = 500;
      if (elapsed < minDelay)
        await new Promise((r) => setTimeout(r, minDelay - elapsed));

      if (!res.ok) {
        const err = await res
          .json()
          .catch(() => ({ message: "เกิดข้อผิดพลาด" }));
        throw new Error(err.message || "เกิดข้อผิดพลาด");
      }

      const updatedUser = await res.json();

      closeModal();
      showModal("success", { message: "อัปเดตข้อมูลสำเร็จ!" });

      setTimeout(() => {
        onUpdated(updatedUser);
        onClose();
      }, 1500);
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

  const handleClose = () => {
    setFormError({});
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: (theme) => ({
          bgcolor: theme.palette.background.paper,
          color: theme.palette.text.primary,
        }),
      }}
    >
      <DialogTitle sx={{ fontWeight: 600 }}>แก้ไขโปรไฟล์</DialogTitle>
      <DialogContent>
        <form id="edit-profile-form" onSubmit={handleSubmitWithConfirm}>
          <TextField
            label="ชื่อ"
            name="name"
            value={form.name}
            onChange={handleChange}
            fullWidth
            margin="dense"
            error={!!formError.name}
            helperText={formError.name}
          />
          <TextField
            label="อีเมล"
            name="email"
            value={form.email}
            onChange={handleChange}
            fullWidth
            margin="dense"
            error={!!formError.email}
            helperText={formError.email}
          />
          <FormControl fullWidth margin="dense" error={!!formError.role}>
            <InputLabel id="role-label">บทบาท</InputLabel>
            <Select
              labelId="role-label"
              name="role"
              value={form.role}
              onChange={handleChange}
              label="บทบาท"
            >
              <MenuItem value="USER">ผู้ใช้</MenuItem>
              <MenuItem value="ADMIN">ผู้ดูแลระบบ</MenuItem>
              <MenuItem value="SUPER_ADMIN">ผู้ดูแลระบบสูงสุด</MenuItem>
            </Select>
            {formError.role && (
              <FormHelperText>{formError.role}</FormHelperText>
            )}
          </FormControl>

          <DialogActions sx={{ mt: 2 }}>
            <Button onClick={handleClose}>ยกเลิก</Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ fontWeight: 600 }}
            >
              บันทึก
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
}
