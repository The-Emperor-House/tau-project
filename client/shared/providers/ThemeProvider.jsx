'use client';
import { useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { getTheme } from '@/shared/theme/getTheme';

export default function ThemeProvider({ children }) {
  const theme = useMemo(() => getTheme(), []);
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}
