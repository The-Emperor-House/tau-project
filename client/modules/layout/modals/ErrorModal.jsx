'use client';

import { Dialog, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

export default function ErrorModal({ open, onClose, message }) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogContent
        sx={{
          textAlign: 'center',
          p: 4,
          bgcolor: 'background.paper', 
        }}
      >
        <ErrorOutlineIcon
          sx={{
            fontSize: 80,
            color: 'error.main',      
            mb: 2,
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
          color="error"                    
          onClick={onClose}
          sx={{ minWidth: 120, '&:hover': { bgcolor: 'error.dark' } }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
