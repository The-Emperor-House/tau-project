"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const ACCENT = "#cc8f2a";

// แถบ progress บาง ๆ ด้านบนจอระหว่างเปลี่ยนหน้า — ใช้แทน loading.jsx แบบเต็มจอ
// หน้าเดิมจะค้างอยู่จนหน้าใหม่พร้อม ไม่มีจอมืด/จอว่างคั่น
export default function NavigationProgress() {
  const pathname = usePathname();
  const [state, setState] = useState("idle"); // idle | loading | done
  const stateRef = useRef(state);
  const timers = useRef([]);

  const update = (next) => {
    stateRef.current = next;
    setState(next);
  };
  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  // เริ่มเมื่อคลิกลิงก์ภายในเว็บที่พาไปหน้าอื่น
  useEffect(() => {
    const onClick = (e) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = e.target?.closest?.("a[href]");
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;

      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      // ลิงก์ hash / หน้าเดิม ไม่ได้เปลี่ยนหน้า
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;

      clearTimers();
      update("loading");
      // กันแถบค้างถ้าการเปลี่ยนหน้าถูกยกเลิก
      timers.current.push(setTimeout(() => update("idle"), 10000));
    };

    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      clearTimers();
    };
  }, []);

  // จบเมื่อ pathname เปลี่ยน (หน้าใหม่ render แล้ว)
  useEffect(() => {
    if (stateRef.current !== "loading") return;
    clearTimers();
    update("done");
    timers.current.push(setTimeout(() => update("idle"), 400));
  }, [pathname]);

  if (state === "idle") return null;

  return (
    <div
      aria-hidden
      className="fixed top-0 left-0 right-0 h-[2px] z-[10000] pointer-events-none origin-left"
      style={{
        background: ACCENT,
        boxShadow: `0 0 8px ${ACCENT}`,
        ...(state === "loading"
          ? { animation: "nav-progress 8s cubic-bezier(0.1, 0.8, 0.2, 1) forwards" }
          : { transform: "scaleX(1)", opacity: 0, transition: "opacity 300ms ease 100ms" }),
      }}
    >
      <style>{`@keyframes nav-progress { from { transform: scaleX(0) } to { transform: scaleX(0.9) } }`}</style>
    </div>
  );
}
