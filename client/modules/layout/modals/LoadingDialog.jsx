"use client";

import {
  Dialog, DialogContent, DialogTitle,
} from "@/shared/components/ui/dialog";
import { Loader2 } from "lucide-react";

// progress: ตัวเลข 0-100 = แสดงแถบความคืบหน้า, null = แสดงแค่ spinner
export default function LoadingDialog({
  open,
  text = "Loading...",
  progress = null,
  blocking = true,
  onClose,
}) {
  const handleOpenChange = (o) => {
    if (!o && !blocking) onClose?.();
  };
  const hasProgress = typeof progress === "number";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xs" showCloseButton={false}>
        <DialogTitle className="sr-only">{text}</DialogTitle>
        <div className="flex flex-col gap-3 py-2">
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground shrink-0" />
            <p className="text-sm text-muted-foreground" aria-live="polite">{text}</p>
          </div>
          {hasProgress && (
            <div
              className="h-1.5 w-full rounded-full bg-muted overflow-hidden"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
            >
              <div
                className="h-full rounded-full bg-[#cc8f2a] transition-[width] duration-200 ease-out"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
