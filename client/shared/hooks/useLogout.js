// hooks/useLogout.js
import { useCallback } from "react";
import { signOut } from "next-auth/react";
import useModalContext from "@/shared/hooks/useModalContext";

// ถามยืนยันก่อนออกจากระบบ แล้วแสดง loading ระหว่างรอ
// การ revoke refresh token ที่ backend ทำใน events.signOut ของ NextAuth (ฝั่ง server)
export function useLogout() {
  const { showModal, showLoading, hideLoading } = useModalContext();

  const signOutNow = useCallback(async () => {
    showLoading("กำลังออกจากระบบ...");
    try {
      await signOut({ callbackUrl: "/auth/login" });
    } catch (err) {
      console.error("Logout error:", err);
      hideLoading();
    }
  }, [showLoading, hideLoading]);

  const logout = useCallback(() => {
    showModal("logout", {
      title: "ออกจากระบบ?",
      message: "ต้องการออกจากระบบตอนนี้หรือไม่",
      confirmText: "ออกจากระบบ",
      cancelText: "ยกเลิก",
      onConfirm: signOutNow,
    });
  }, [showModal, signOutNow]);

  return { logout };
}
