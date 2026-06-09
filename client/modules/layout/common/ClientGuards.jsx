"use client";
import { useEffect } from "react";

export default function ClientGuards() {
  useEffect(() => {
    // ❌ คลิกขวา
    const onContextMenu = (e) => e.preventDefault();
    document.addEventListener("contextmenu", onContextMenu);

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

    // ใส่ draggable=false ให้ลิงก์ทั้งหมด (รวมไอคอนที่เป็นลิงก์)
    const setNoDrag = (el) => {
      try {
        el.setAttribute("draggable", "false");
        el.style.webkitUserDrag = "none"; // Safari/Chrome
      } catch {}
    };
    const disableDragOnAnchors = (root = document) => {
      root.querySelectorAll('a, [role="link"]').forEach(setNoDrag);
      // กันรูปทุกตัวด้วย (สำรองจาก onDragStart)
      root.querySelectorAll("img, svg").forEach(setNoDrag);
    };
    disableDragOnAnchors();

    // จับลิงก์/รูปที่ถูกเพิ่มเข้ามาภายหลัง (เช่นจาก React state/SSR hydration)
    const mo = new MutationObserver((muts) => {
      for (const m of muts) {
        m.addedNodes.forEach((n) => {
          if (n.nodeType === 1) disableDragOnAnchors(n);
        });
      }
    });
    mo.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });

    // ❌ คัดลอก/ตัด
    const onCopy = (e) => e.preventDefault();
    const onCut = (e) => e.preventDefault();
    document.addEventListener("copy", onCopy);
    document.addEventListener("cut", onCut);

    return () => {
      document.removeEventListener("contextmenu", onContextMenu);
      window.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("dragstart", onDragStart, true);
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("cut", onCut);
      mo.disconnect();
    };
  }, []);

  return null;
}
