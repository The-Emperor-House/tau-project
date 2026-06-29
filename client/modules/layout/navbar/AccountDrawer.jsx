"use client";

import { Sheet, SheetContent } from "@/shared/components/ui/sheet";
import AccountPanel from "./AccountPanel";

export default function AccountDrawer({ open, onClose, onLogout }) {
  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="bg-neutral-900 text-white border-l border-white/10 w-[min(85vw,320px)] p-0">
        <AccountPanel onClose={onClose} onLogout={onLogout} />
      </SheetContent>
    </Sheet>
  );
}
