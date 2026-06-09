'use client';

import {
  Dialog,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

export default function SuccessModal({ open, onClose, message }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}             
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          borderRadius: 3,
          bgcolor: 'background.paper', 
          boxShadow: 8,            
        },
      }}
    >
      <DialogContent sx={{ textAlign: 'center', p: 4 }}>
        <Box
          sx={{
            width: 100,
            height: 100,
            mx: 'auto',
            mb: 2,
            borderRadius: '50%',
            bgcolor: 'success.main',        
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'pop 240ms ease',
            '@keyframes pop': {
              from: { transform: 'scale(0.9)', opacity: 0 },
              to: { transform: 'scale(1)', opacity: 1 },
            },
          }}
        >
          <CheckCircleOutlineIcon sx={{ fontSize: 60, color: 'success.contrastText' }} />
        </Box>

        <Typography variant="h6" sx={{ mt: 1, fontWeight: 700, color: 'text.primary' }}>
          {typeof message === 'string' ? message : 'Success'}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
        <Button
          onClick={onClose}
          variant="contained"
          color="success"                       
          sx={{
            fontWeight: 600,
            px: 4,
            borderRadius: 2,
            boxShadow: 4,                     
            '&:hover': { bgcolor: 'success.dark' },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
