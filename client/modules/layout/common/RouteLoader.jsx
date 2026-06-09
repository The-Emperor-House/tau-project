'use client';

import { Box, LinearProgress } from '@mui/material';

export default function RouteLoader() {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 9998,
      }}
    >
      <LinearProgress sx={{
        height: 3,
        '& .MuiLinearProgress-bar': { backgroundColor: '#ab9685' }
      }} />
    </Box>
  );
}
