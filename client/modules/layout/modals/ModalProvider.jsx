"use client";

import { createContext, useMemo, useState, useCallback } from "react";
import LoadingDialog from "./LoadingDialog";
import ConfirmDialog from "./ConfirmDialog";
import ErrorModal from "./ErrorModal";
import WarningModal from "./WarningModal";
import SuccessModal from "./SuccessModal";
import LogoutDialog from "./LogoutDialog";

export const ModalContext = createContext(null);

export default function ModalProvider({ children }) {
  // ---- Loading ----
  const [loading, setLoading] = useState({ open: false, message: "" });

  // ---- Confirm (promise-based) ----
  const [confirm, setConfirm] = useState({
    open: false,
    title: "Confirm",
    message: "Are you sure?",
    confirmText: "Confirm",
    cancelText: "Cancel",
    _resolver: null,
  });

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
  const showLoading = useCallback((message = "Loading...") => {
    setLoading({ open: true, message });
  }, []);
  
  const hideLoading = useCallback(
    () => setLoading({ open: false, message: "" }),
    []
  );

  const confirmAsync = useCallback(
    (opts = {}) =>
      new Promise((resolve) => {
        setConfirm((prev) => ({
          ...prev,
          ...opts,
          open: true,
          _resolver: resolve,
        }));
      }),
    []
  );

  const handleConfirmClose = useCallback(
    (ok) => {
      if (confirm._resolver) confirm._resolver(!!ok);
      setConfirm((prev) => ({ ...prev, open: false, _resolver: null }));
    },
    [confirm._resolver]
  );

  const closeModal = useCallback(() => {
    // ปิดทุก modal (กันหลงค้าง)
    setLoading({ open: false, message: "" });
    setError((p) => ({ ...p, open: false }));
    setWarning((p) => ({ ...p, open: false }));
    setSuccess((p) => ({ ...p, open: false }));
    setLogout((p) => ({ ...p, open: false, onConfirm: null }));
    setConfirm((p) => ({ ...p, open: false, _resolver: null }));
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
      hideLoading,
      confirm: confirmAsync,
      // ใหม่
      showModal,
      closeModal,
    }),
    [showLoading, hideLoading, confirmAsync, showModal, closeModal]
  );

  return (
    <ModalContext.Provider value={value}>
      {children}

      {/* Loading */}
      <LoadingDialog open={loading.open} text={loading.message} />

      {/* Confirm */}
      <ConfirmDialog
        open={confirm.open}
        title={confirm.title}
        message={confirm.message}
        confirmText={confirm.confirmText}
        cancelText={confirm.cancelText}
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
