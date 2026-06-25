"use client";
import { useEffect } from "react";

export default function ClientGuards() {
  useEffect(() => {
    // ⛔ คีย์ลัดยอดนิยม
    const onKeyDown = (e) => {
      const ctrlOrCmd = e.ctrlKey || e.metaKey;
      const key = (e.key || "").toUpperCase();
      const blocked =
        key === "F12" ||
        (ctrlOrCmd && e.shiftKey && ["I", "J", "C"].includes(key)) ||
        (ctrlOrCmd && ["U", "S", "P"].includes(key));
      if (blocked) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener("keydown", onKeyDown, true);

    // ❌ ลากรูป & ลากลิงก์
    const onDragStart = (e) => {
      const target = e.target;
      const tag = (target?.tagName || "").toLowerCase();

      // รูปภาพ
      if (tag === "img") {
        e.preventDefault();
        return;
      }
      // ลิงก์ (หรือองค์ประกอบภายในลิงก์)
      const link = target?.closest?.('a, [role="link"]');
      if (link) {
        e.preventDefault();
      }
    };
    document.addEventListener("dragstart", onDragStart, true);
    // หมายเหตุ: ป้องกันการลากรูป/ลิงก์ด้วย CSS (-webkit-user-drag: none ใน globals.css)
    // แทนการแก้ DOM attribute/style ตรงๆ ที่นี่ เพราะการ mutate node ที่ React ควบคุมอยู่
    // (ผ่าน MutationObserver) ชิงจังหวะ hydration ทำให้เกิด hydration mismatch error

    // ❌ คัดลอก/ตัด
    const onCopy = (e) => e.preventDefault();
    const onCut = (e) => e.preventDefault();
    document.addEventListener("copy", onCopy);
    document.addEventListener("cut", onCut);

    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("dragstart", onDragStart, true);
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("cut", onCut);
      mo.disconnect();
    };
  }, []);

  return null;
}
