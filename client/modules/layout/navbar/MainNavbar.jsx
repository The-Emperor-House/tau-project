"use client";

import { useState, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLogout } from "@/shared/hooks/useLogout";
import { Menu, LogIn } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

import LogoSwap from "./LogoSwap";
import NavLinks from "./NavLinks";
import MobileNavDrawer from "./MobileNavDrawer";
export default function MainNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { data: session, status } = useSession();
  const router = useRouter();
  const isAuthed = status === "authenticated";
  const { logout } = useLogout();

  const navLinks = useMemo(
    () => [
      { href: "/", label: "Home" },
      { href: "/about-us", label: "About Us" },
      { href: "/design", label: "Design" },
      { href: "/projects", label: "Projects" },
      { href: "/furniture", label: "Showroom" },
      { href: "/news", label: "News & Events" },
      { href: "/contact", label: "Contact" },
    ],
    []
  );

  const handleSmoothScroll = useCallback((e, href) => {
    if (href.startsWith("/#")) {
      e.preventDefault();
      const id = href.slice(2);
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        window.history.pushState(null, "", href);
        setIsMobileMenuOpen(false);
      }
    }
  }, []);

  const handleLogout = () => {
    logout(session?.refreshToken);
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      id="main-navbar"
      className="absolute left-0 right-0 z-50 bg-transparent"
      style={{ top: "var(--announcement-h, 50px)" }}
    >
      <div className="flex items-center justify-between px-4 md:px-6 lg:px-8 py-2 max-w-[1400px] mx-auto w-full">
        {/* Logo */}
        <LogoSwap
          width={110}
          height={70}
          showOnXs
          className="shrink-0 md:w-[160px] md:h-[96px] lg:w-[200px] lg:h-[120px]"
        />

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-2 lg:gap-3 ml-auto">
          <NavLinks links={navLinks} onSmoothScroll={handleSmoothScroll} />

          {isAuthed ? (
            <Link
              href="/dashboard/furniture"
              className="ml-2 px-4 py-1.5 text-sm font-medium text-black rounded-lg transition-colors"
              style={{ background: 'linear-gradient(135deg, #cc8f2a, #b57b14)' }}
            >
              Dashboard
            </Link>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/auth/login')}
              className="text-white hover:text-white hover:bg-white/10 ml-1"
              aria-label="login"
            >
              <LogIn className="w-5 h-5" />
            </Button>
          )}
        </div>

        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-white hover:text-white hover:bg-white/10 ml-auto"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="open menu"
        >
          <Menu className="w-6 h-6" />
        </Button>
      </div>

      <MobileNavDrawer
        open={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        links={navLinks}
        extra={
          isAuthed ? (
            <div className="px-4 py-3 space-y-2">
              <Link
                href="/dashboard/furniture"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center w-full py-2.5 text-sm font-medium text-black rounded-lg"
                style={{ background: 'linear-gradient(135deg, #cc8f2a, #b57b14)' }}
              >
                Dashboard
              </Link>
              <button
                onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                className="w-full py-2.5 text-sm text-neutral-300 border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
              >
                ออกจากระบบ
              </button>
            </div>
          ) : (
            <div className="px-4 py-3">
              <button
                onClick={() => { setIsMobileMenuOpen(false); router.push('/auth/login'); }}
                className="flex items-center justify-center gap-2 w-full py-2.5 text-sm text-white border border-white/20 rounded-lg hover:bg-white/5 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                เข้าสู่ระบบ
              </button>
            </div>
          )
        }
      />

    </header>
  );
}
