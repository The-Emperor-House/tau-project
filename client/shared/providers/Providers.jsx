'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '@/shared/theme';
import ModalProvider from "@/modules/layout/modals/ModalProvider";

export function Providers({ children }) {
  return (
    <SessionProvider refetchInterval={0}>
      <ThemeProvider>
        <ModalProvider>{children}</ModalProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}