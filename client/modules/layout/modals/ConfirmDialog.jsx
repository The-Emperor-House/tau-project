"use client";

import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Typography, Button
} from "@mui/material";

export default function ConfirmDialog({
  open,
  title = "Confirm",
  message = "Are you sure?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  destructive = false,     // ❗️ถ้า true ใช้ปุ่มสี error
  onClose,
}) {
  const confirmColor = destructive ? "error" : "primary";

  return (
    <Dialog
      open={open}
      onClose={() => onClose?.(false)}   // ปิดด้วย backdrop/ESC => false
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle>{title}</DialogTitle>

      <DialogContent>
        <Typography sx={{ mt: 0.5, color: "text.primary" }}>
          {message}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={() => onClose?.(false)}>
          {cancelText}
        </Button>
        <Button
          variant="contained"
          color={confirmColor}
          onClick={() => onClose?.(true)}
          autoFocus                           
          sx={{ "&:hover": { bgcolor: `${confirmColor}.dark` } }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
