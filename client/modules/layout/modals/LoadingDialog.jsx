"use client";

import {
  Dialog,
  DialogContent,
  Stack,
  CircularProgress,
  Typography,
} from "@mui/material";

export default function LoadingDialog({
  open,
  text = "Loading...",
  blocking = true,
  onClose,
  size = 28,
}) {
  const handleClose = (event, reason) => {
    if (blocking && (reason === "backdropClick" || reason === "escapeKeyDown")) return;
    onClose?.(event, reason);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="xs"
      keepMounted
      sx={{
        zIndex: (t) => t.zIndex.modal + 10,
      }}
      disableEnforceFocus
      PaperProps={{ sx: { p: 3, borderRadius: 3 } }}
      slotProps={{
        backdrop: {
          sx: { zIndex: (t) => t.zIndex.modal + 9, bgcolor: "rgba(0,0,0,0.35)" },
        },
      }}
    >
      <DialogContent>
        <Stack direction="row" alignItems="center" spacing={2}>
          <CircularProgress size={size} />
          <Typography color="text.secondary">{text}</Typography>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
