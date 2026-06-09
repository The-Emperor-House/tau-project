"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Avatar,
  IconButton,
  Box,
  CircularProgress,
} from "@mui/material";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import { useState } from "react";

export default function EditProfileDialog({
  open,
  onClose,
  user,
  token,
  onUpdated,
}) {
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
        headers: {
          "Authorization": `Bearer ${token}`,
        },
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
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>แก้ไขรูปโปรไฟล์</DialogTitle>
      <DialogContent sx={{ display: "flex", justifyContent: "center", my: 2 }}>
        <Box sx={{ position: "relative" }}>
          <Avatar
            src={avatarPreview}
            alt={user.name || "User"}
            sx={{ width: 120, height: 120 }}
            imgProps={{
              onError: (e) => {
                e.target.onerror = null;
                e.target.src = "";
              },
            }}
          >
            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
          </Avatar>

          <IconButton
            component="label"
            sx={{
              position: "absolute",
              bottom: 0,
              right: 0,
              bgcolor: "background.paper",
              boxShadow: 2,
              "&:hover": { bgcolor: "background.default" },
            }}
          >
            <PhotoCamera />
            <input
              hidden
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          </IconButton>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
