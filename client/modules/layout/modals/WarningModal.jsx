'use client';

import { Dialog, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

export default function WarningModal({ open, onClose, message }) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogContent
        sx={{
          textAlign: 'center',
          p: 4,
          bgcolor: 'background.paper',
        }}
      >
        <WarningAmberIcon
          sx={{
            fontSize: 80,
            color: 'warning.main',
            mb: 2,
            // เอฟเฟกต์โผล่นิดๆ
            animation: 'pop 240ms ease',
            '@keyframes pop': {
              from: { transform: 'scale(0.9)', opacity: 0 },
              to: { transform: 'scale(1)', opacity: 1 },
            },
          }}
        />
        <Typography sx={{ color: 'text.primary' }}>{message}</Typography>
      </DialogContent>

      <DialogActions
        sx={{
          justifyContent: 'center',
          bgcolor: 'background.paper',
          pb: 3,
        }}
      >
        <Button
          variant="contained"
          color="warning"
          onClick={onClose}
          sx={{ minWidth: 120 }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
