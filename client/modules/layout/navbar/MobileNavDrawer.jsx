"use client";

import Link from "next/link";
import { Sheet, SheetContent } from "@/shared/components/ui/sheet";
import { Separator } from "@/shared/components/ui/separator";
import { cn } from "@/shared/lib/cn";
import { usePathname } from "next/navigation";

export default function MobileNavDrawer({ open, onClose, links, extra }) {
  const pathname = usePathname() || "/";
  const isActive = (href) => pathname === href || pathname.startsWith(href + "/");

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="bg-neutral-900 text-white border-l border-white/10 w-[min(85vw,280px)] p-0">
        <nav className="flex flex-col pt-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={cn(
                "px-6 py-3 text-base transition-colors hover:bg-white/5",
                isActive(link.href) ? "text-primary font-medium" : "text-white"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        {extra && (
          <>
            <Separator className="my-2 bg-white/10" />
            {extra}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
