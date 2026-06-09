"use client";

import {
  Drawer,
  Box,
  IconButton,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";

import AccountPanel from "./AccountPanel";

export default function AccountDrawer({ open, onClose, onLogout }) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: (t) => ({
          bgcolor: "grey.900",
          color: "common.white",
          width: 320,
          borderLeft: `1px solid ${alpha(t.palette.common.white, 0.12)}`,
        }),
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "flex-end", p: 2 }}>
        <IconButton onClick={onClose} sx={{ color: "common.white" }} aria-label="close account drawer">
          <CloseIcon />
        </IconButton>
      </Box>

      <AccountPanel onClose={onClose} onLogout={onLogout} />
    </Drawer>
  );
}
