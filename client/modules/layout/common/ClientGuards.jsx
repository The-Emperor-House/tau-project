"use client";
import { useEffect } from "react";

// กันลากรูป/ลิงก์ออกจากหน้าเว็บเท่านั้น — ไม่กันคีย์ลัด, copy หรือการพิมพ์
// เพื่อให้ลูกค้าคัดลอกเบอร์โทร/อีเมล/ที่อยู่ และพิมพ์หน้าเว็บได้ตามปกติ
export default function ClientGuards({ enabled = true }) {
  useEffect(() => {
    if (!enabled) return;

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

    return () => {
      document.removeEventListener("dragstart", onDragStart, true);
    };
  }, [enabled]);

  return null;
}
