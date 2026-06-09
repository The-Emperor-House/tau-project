"use client";

import React, { useEffect, useRef } from "react";

/**
 * Sparkles.jsx
 * - เอฟเฟกต์ประกายไฟแบบเบา ๆ ด้วย <canvas>
 * - ไม่ใช้ไลบรารีเสริม, ทำงานเฉพาะ client, รองรับ high-DPI
 *
 * Props:
 * - minSize:      ขนาดจุดขั้นต่ำ (px)
 * - maxSize:      ขนาดจุดสูงสุด (px)
 * - particleDensity: ความหนาแน่น (เลขมาก = อนุภาคมาก) อ้างอิงจากพื้นที่
 * - particleColor:   สีของอนุภาค (hex/rgb/rgba)
 * - speed:        ความเร็วเฉลี่ยในการไหล (px ต่อเฟรม โดยประมาณ)
 * - className:    ใช้ต่อยอดสไตล์/เลย์เอาต์ภายนอก
 */
export default function Sparkles({
  minSize = 0.5,
  maxSize = 1.6,
  particleDensity = 60,
  particleColor = "#ffffff",
  speed = 0.5,
  className = "",
}) {
  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);
  const rafRef = useRef(null);

  // สร้างอนุภาค
  const particlesRef = useRef([]);
  const lastSizeRef = useRef({ w: 0, h: 0, dpr: 1 });

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Helper: คำนวณจำนวนอนุภาคตามพื้นที่และความหนาแน่น
  const calcParticleCount = (w, h) => {
    const base = Math.max(12000, 1);
    const areaFactor = (w * h) / base;
    const densityFactor = particleDensity / 60; // 60 = baseline
    const count = Math.round(areaFactor * densityFactor);
    return Math.max(12, Math.min(count, 400));
  };

  const rand = (min, max) => Math.random() * (max - min) + min;

  const makeParticles = (w, h) => {
    const count = calcParticleCount(w, h);
    const arr = [];
    for (let i = 0; i < count; i++) {
      const size = rand(minSize, maxSize);
      arr.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: size,
        vy: rand(speed * 0.25, speed * 1.25),
        vx: rand(-speed * 0.15, speed * 0.15),
        alphaBase: rand(0.45, 0.9),
        alphaAmp: rand(0.08, 0.25),
        phase: Math.random() * Math.PI * 2,
        phaseSpeed: rand(0.006, 0.02),
      });
    }
    particlesRef.current = arr;
  };

  const fitCanvas = () => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    const rect = wrapper.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.floor(rect.width));
    const h = Math.max(1, Math.floor(rect.height));

    const last = lastSizeRef.current;
    if (last.w === w && last.h === h && last.dpr === dpr) return;

    lastSizeRef.current = { w, h, dpr };

    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    makeParticles(w, h);
  };

  const tick = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const { w, h } = lastSizeRef.current;

    ctx.clearRect(0, 0, w, h);

    const colorIsRgba = /^rgba?\(/i.test(particleColor);
    let r = 255, g = 255, b = 255;
    if (!colorIsRgba && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(particleColor)) {
      const hex = particleColor.replace("#", "");
      const full =
        hex.length === 3
          ? hex.split("").map((c) => c + c).join("")
          : hex;
      r = parseInt(full.slice(0, 2), 16);
      g = parseInt(full.slice(2, 4), 16);
      b = parseInt(full.slice(4, 6), 16);
    }

    const particles = particlesRef.current;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // update
      p.y += p.vy;
      p.x += p.vx;
      p.phase += p.phaseSpeed;

      // wrap
      if (p.y - p.r > h) {
        p.y = -p.r - rand(0, 20);
        p.x = Math.random() * w;
      }
      if (p.x + p.r < 0) p.x = w + p.r;
      if (p.x - p.r > w) p.x = -p.r;

      // alpha shimmer
      const a = Math.max(0, Math.min(1, p.alphaBase + Math.sin(p.phase) * p.alphaAmp));

      // draw
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);

      if (colorIsRgba) {
        const m = particleColor.replace(/\s+/g, "").match(/^rgba?\((\d+),(\d+),(\d+)(?:,(.+))?\)$/i);
        if (m) {
          const rr = +m[1];
          const gg = +m[2];
          const bb = +m[3];
          ctx.fillStyle = `rgba(${rr}, ${gg}, ${bb}, ${a})`;
        } else {
          ctx.fillStyle = `rgba(255,255,255,${a})`;
        }
      } else {
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
      }

      ctx.fill();
    }

    rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    if (prefersReducedMotion) return;

    if (wrapperRef.current) {
      wrapperRef.current.style.pointerEvents = "none";
    }

    const handleResize = () => fitCanvas();
    fitCanvas();
    window.addEventListener("resize", handleResize);

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minSize, maxSize, particleDensity, particleColor, speed, prefersReducedMotion]);

  if (prefersReducedMotion) {
    return <div className={className} ref={wrapperRef} aria-hidden />;
  }

  return (
    <div
      ref={wrapperRef}
      className={className}
      style={{
        position: "absolute",
        inset: 0,
      }}
      aria-hidden
    >
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
}
