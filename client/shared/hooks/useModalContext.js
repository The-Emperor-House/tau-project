"use client";
import { useContext } from "react";
import { ModalContext } from "@/modules/layout/modals/ModalProvider";

export function useModalContext() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModalContext must be used within a ModalProvider");
  // รองรับชื่อเก่าด้วย
  const showModal = ctx.showModal || ctx.openModal;
  const closeModal = ctx.closeModal || ctx.hideModal;
  const { showLoading, hideLoading, confirm } = ctx;
  return { ...ctx, showModal, closeModal, showLoading, hideLoading, confirm };
}
export default useModalContext;
