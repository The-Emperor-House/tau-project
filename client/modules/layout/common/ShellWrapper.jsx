'use client';

import { usePathname } from 'next/navigation';
import MainNavbar from '@/modules/layout/navbar/MainNavbar';
import Footer from '@/modules/layout/footer/Footer';

const HIDE_SHELL_ROUTES = ['/dashboard', '/auth'];

export default function ShellWrapper({ children }) {
  const pathname = usePathname();
  const hideShell = HIDE_SHELL_ROUTES.some((r) => pathname.startsWith(r));

  return (
    <>
      {!hideShell && <MainNavbar />}
      <main>{children}</main>
      {!hideShell && <Footer />}
    </>
  );
}
