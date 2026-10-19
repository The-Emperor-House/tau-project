"use client";

import { createContext, useMemo, useState, useCallback, useRef } from "react";
import LoadingDialog from "./LoadingDialog";
import ConfirmDialog from "./ConfirmDialog";
import ErrorModal from "./ErrorModal";
import WarningModal from "./WarningModal";
import SuccessModal from "./SuccessModal";
import LogoutDialog from "./LogoutDialog";

export const ModalContext = createContext(null);

const CONFIRM_DEFAULTS = {
  title: "Confirm",
  message: "Are you sure?",
  confirmText: "Confirm",
  cancelText: "Cancel",
  destructive: false,
};

export default function ModalProvider({ children }) {
  // ---- Loading ----
  // progress: ตัวเลข 0-100 = แสดงแถบความคืบหน้า, null = แสดงแค่ spinner
  const [loading, setLoading] = useState({ open: false, message: "", progress: null });

  // ---- Confirm (promise-based) ----
  const [confirm, setConfirm] = useState({ open: false, ...CONFIRM_DEFAULTS });
  // resolver + onConfirm ของ confirm ที่เปิดอยู่ — เก็บใน ref กัน closure เก่า
  const confirmPending = useRef(null);

  // ---- Other modals ----
  const [error, setError] = useState({
    open: false,
    title: "Error",
    message: "Something went wrong",
    closeText: "Close",
  });

  const [warning, setWarning] = useState({
    open: false,
    title: "Warning",
    message: "Please confirm",
    closeText: "OK",
  });

  const [success, setSuccess] = useState({
    open: false,
    title: "Success",
    message: "Operation completed",
    closeText: "Great!",
  });

  const [logout, setLogout] = useState({
    open: false,
    title: "Sign out?",
    message: "Do you want to sign out now?",
    confirmText: "Sign out",
    cancelText: "Cancel",
    onConfirm: null,
  });

  // ---- helpers ----
  const showLoading = useCallback((message = "Loading...", progress = null) => {
    setLoading({ open: true, message, progress });
  }, []);

  // อัปเดตข้อความ/ความคืบหน้าของ loading ที่เปิดอยู่ (ไม่เปิดใหม่ถ้าปิดไปแล้ว)
  const updateLoading = useCallback(({ message, progress = null } = {}) => {
    setLoading((prev) => (prev.open ? { ...prev, message: message ?? prev.message, progress } : prev));
  }, []);

  const hideLoading = useCallback(
    () => setLoading({ open: false, message: "", progress: null }),
    []
  );

  // คืน Promise<boolean> และถ้าส่ง onConfirm มา จะเรียกให้หลังผู้ใช้กดยืนยัน (หลัง dialog ปิด)
  const confirmAsync = useCallback(
    (opts = {}) =>
      new Promise((resolve) => {
        // ถ้ามี confirm ค้างอยู่ ให้ถือว่ายกเลิก กัน promise เก่าค้างตลอดไป
        confirmPending.current?.resolve(false);
        const { onConfirm, ...rest } = opts;
        confirmPending.current = { resolve, onConfirm };
        setConfirm({ ...CONFIRM_DEFAULTS, ...rest, open: true });
      }),
    []
  );

  const handleConfirmClose = useCallback((ok) => {
    const pending = confirmPending.current;
    confirmPending.current = null;
    setConfirm((prev) => ({ ...prev, open: false }));
    if (!pending) return;

    pending.resolve(!!ok);
    if (ok && typeof pending.onConfirm === "function") {
      // ให้ confirm ปิดก่อน แล้วค่อยเริ่มงาน (เช่น เปิด loading)
      Promise.resolve().then(() => pending.onConfirm());
    }
  }, []);

  const closeModal = useCallback(() => {
    // ปิดทุก modal (กันหลงค้าง)
    setLoading({ open: false, message: "", progress: null });
    setError((p) => ({ ...p, open: false }));
    setWarning((p) => ({ ...p, open: false }));
    setSuccess((p) => ({ ...p, open: false }));
    setLogout((p) => ({ ...p, open: false, onConfirm: null }));
    confirmPending.current?.resolve(false);
    confirmPending.current = null;
    setConfirm((p) => ({ ...p, open: false }));
  }, []);

  // ---- showModal dispatcher (API ที่หน้า test เรียก) ----
  const showModal = useCallback(
    (id, props = {}) => {
      switch (id) {
        case "loading":
          return showLoading(props?.message ?? "Loading...");
        case "confirm":
          return confirmAsync(props);
        case "error":
          return setError((prev) => ({ ...prev, ...props, open: true }));
        case "warning":
          return setWarning((prev) => ({ ...prev, ...props, open: true }));
        case "success":
          return setSuccess((prev) => ({ ...prev, ...props, open: true }));
        case "logout":
          return setLogout((prev) => ({ ...prev, ...props, open: true }));
        case "test-modal":
          // ตัวอย่าง route ไปที่ success modal
          return setSuccess((prev) => ({
            ...prev,
            title: props?.title ?? "Test Modal",
            message: props?.message ?? "Hello from test modal",
            closeText: props?.closeText ?? "Close",
            open: true,
          }));
        default:
          console.warn(`Unknown modal id: ${id}`);
      }
    },
    [confirmAsync, showLoading]
  );

  const value = useMemo(
    () => ({
      // เดิม
      showLoading,
      updateLoading,
      hideLoading,
      confirm: confirmAsync,
      // ใหม่
      showModal,
      closeModal,
    }),
    [showLoading, updateLoading, hideLoading, confirmAsync, showModal, closeModal]
  );

  return (
    <ModalContext.Provider value={value}>
      {children}

      {/* Loading */}
      <LoadingDialog open={loading.open} text={loading.message} progress={loading.progress} />

      {/* Confirm */}
      <ConfirmDialog
        open={confirm.open}
        title={confirm.title}
        message={confirm.message}
        confirmText={confirm.confirmText}
        cancelText={confirm.cancelText}
        destructive={confirm.destructive}
        onClose={handleConfirmClose}
      />

      {/* Error */}
      <ErrorModal
        open={error.open}
        title={error.title}
        message={error.message}
        closeText={error.closeText}
        onClose={() => setError((p) => ({ ...p, open: false }))}
      />

      {/* Warning */}
      <WarningModal
        open={warning.open}
        title={warning.title}
        message={warning.message}
        closeText={warning.closeText}
        onClose={() => setWarning((p) => ({ ...p, open: false }))}
      />

      {/* Success */}
      <SuccessModal
        open={success.open}
        title={success.title}
        message={success.message}
        closeText={success.closeText}
        onClose={() => setSuccess((p) => ({ ...p, open: false }))}
      />

      {/* Logout */}
      <LogoutDialog
        open={logout.open}
        title={logout.title}
        message={logout.message}
        confirmText={logout.confirmText}
        cancelText={logout.cancelText}
        onClose={(ok) => {
          if (ok && typeof logout.onConfirm === "function") {
            // ให้ modal ปิดก่อน แล้วค่อยยิง onConfirm
            setLogout((p) => ({ ...p, open: false }));
            Promise.resolve().then(() => logout.onConfirm?.());
          } else {
            setLogout((p) => ({ ...p, open: false, onConfirm: null }));
          }
        }}
      />
    </ModalContext.Provider>
  );
}
