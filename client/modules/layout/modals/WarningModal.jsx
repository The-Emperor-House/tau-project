'use client';

import {
  Dialog, DialogContent, DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function WarningModal({ open, onClose, message }) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose?.()}>
      <DialogContent className="max-w-xs text-center">
        <div className="flex flex-col items-center gap-3 py-2">
          <div className="w-20 h-20 rounded-full bg-amber-500 flex items-center justify-center animate-[pop_240ms_ease]">
            <AlertTriangle className="w-12 h-12 text-white" />
          </div>
          <p className="text-base font-semibold">
            {typeof message === "string" ? message : "Warning"}
          </p>
        </div>
        <DialogFooter className="justify-center">
          <Button onClick={onClose} className="bg-amber-500 hover:bg-amber-600 text-white px-8">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
