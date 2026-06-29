'use client';

import { SessionProvider } from 'next-auth/react';
import { TooltipProvider } from '@/shared/components/ui/tooltip';
import { Toaster } from 'sonner';
import ModalProvider from "@/modules/layout/modals/ModalProvider";

export function Providers({ children }) {
  return (
    <SessionProvider refetchInterval={0}>
      <TooltipProvider>
        <ModalProvider>{children}</ModalProvider>
        <Toaster position="bottom-center" richColors />
      </TooltipProvider>
    </SessionProvider>
  );
}
