"use client";

import { useState, useCallback, useMemo } from "react";
import { useSession, signIn } from "next-auth/react";
import { useLogout } from "@/shared/hooks/useLogout";
import { Menu, LogIn, User } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip";

import LogoSwap from "./LogoSwap";
import NavLinks from "./NavLinks";
import MobileNavDrawer from "./MobileNavDrawer";
import AccountPanel from "./AccountPanel";
import AccountDrawer from "./AccountDrawer";

export default function MainNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  const { data: session, status } = useSession();
  const isAuthed = status === "authenticated";
  const { logout } = useLogout();

  const navLinks = useMemo(
    () => [
      { href: "/", label: "Home" },
      { href: "/about-us", label: "About Us" },
      { href: "/design", label: "Design" },
      { href: "/projects", label: "Projects" },
      { href: "#furniture", label: "Showroom" },
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
    setIsAccountOpen(false);
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
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsAccountOpen(true)}
              className="text-white hover:text-white hover:bg-white/10 ml-1"
              aria-label="open account menu"
            >
              {session?.user?.image ? (
                <Avatar className="w-8 h-8">
                  <AvatarImage src={session.user.image} alt={session.user.name || "Profile"} />
                  <AvatarFallback>{session.user.name?.charAt(0)}</AvatarFallback>
                </Avatar>
              ) : (
                <User className="w-5 h-5" />
              )}
            </Button>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => signIn()}
                  className="text-white hover:text-white hover:bg-white/10 ml-1"
                  aria-label="login"
                >
                  <LogIn className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Login</TooltipContent>
            </Tooltip>
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
            <AccountPanel
              onClose={() => setIsMobileMenuOpen(false)}
              onLogout={handleLogout}
            />
          ) : (
            <div className="p-4">
              <Button
                className="w-full"
                onClick={() => { setIsMobileMenuOpen(false); signIn(); }}
              >
                <LogIn className="w-4 h-4 mr-2" />
                Login
              </Button>
            </div>
          )
        }
      />

      {isAuthed && (
        <AccountDrawer
          open={isAccountOpen}
          onClose={() => setIsAccountOpen(false)}
          onLogout={handleLogout}
        />
      )}
    </header>
  );
}
