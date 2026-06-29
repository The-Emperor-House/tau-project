"use client";

import {
  Dialog, DialogContent,
} from "@/shared/components/ui/dialog";
import { Loader2 } from "lucide-react";

export default function LoadingDialog({
  open,
  text = "Loading...",
  blocking = true,
  onClose,
}) {
  const handleOpenChange = (o) => {
    if (!o && !blocking) onClose?.();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-xs" showCloseButton={false}>
        <div className="flex items-center gap-3 py-2">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground shrink-0" />
          <p className="text-sm text-muted-foreground">{text}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
