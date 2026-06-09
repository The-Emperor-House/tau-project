"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Slide,
} from "@mui/material";
import { forwardRef, useEffect } from "react";

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function LogoutDialog({
  open,
  onClose,
  title = "Are you sure you want to log out?",
  message = "If you log out, you will need to log in again.",
  confirmText = "Log Out",
  cancelText = "Cancel",
}) {
  // ปิดด้วย ESC → ส่ง false (ยกเลิก)
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") onClose?.(false);
    };
    if (open) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  const handleCancel = () => onClose?.(false);
  const handleConfirm = () => onClose?.(true);

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      TransitionComponent={Transition}
      keepMounted
      fullWidth
      maxWidth="xs"
      sx={{
        "& .MuiPaper-root": { borderRadius: 3 },
        backdropFilter: "blur(4px)",
      }}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography color="text.secondary">{message}</Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleCancel}>{cancelText}</Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          sx={{
            bgcolor: "primary.main",
            "&:hover": { bgcolor: "primary.dark" },
          }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
