"use client";

import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";

export default function LogoutDialog({
  open,
  onClose,
  title = "Are you sure you want to log out?",
  message = "If you log out, you will need to log in again.",
  confirmText = "Log Out",
  cancelText = "Cancel",
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose?.(false)}>
      <DialogContent className="max-w-xs">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onClose?.(false)}>
            {cancelText}
          </Button>
          <Button variant="default" onClick={() => onClose?.(true)}>
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
