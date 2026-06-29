"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";

const Sparkles = dynamic(
  () => import("@/shared/components/ui/Sparkles").then((m) => m.default),
  { ssr: false, loading: () => null }
);

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};

const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut", delay },
  },
});

export default function HeroText() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="relative pointer-events-none"
    >
      {/* Sparkles */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-25 md:opacity-30">
        <Sparkles
          className=""
          minSize={0.5}
          maxSize={1.6}
          particleDensity={60}
          particleColor="#ffffff"
          speed={0.5}
        />
      </div>

      {/* H1 */}
      <motion.div variants={fadeUp(0)}>
        <h1
          className="relative z-[1] font-semibold text-5xl sm:text-6xl md:text-8xl text-[#cc8f2a] tracking-[0.1rem] sm:tracking-[0.3rem] md:tracking-[0.5rem]"
          style={{
            textShadow: "0px 4px 12px rgba(0,0,0,0.8)",
            animation: "track 900ms ease-out both",
          }}
        >
          TAURUS:
        </h1>
      </motion.div>

      {/* H2 */}
      <motion.div variants={fadeUp(0.06)}>
        <h2
          className="relative z-[1] font-thin text-[1.9rem] sm:text-5xl md:text-[3.5rem] lg:text-[5rem] text-white tracking-[0.1rem] sm:tracking-[0.2rem] md:tracking-[0.8rem] mt-2"
          style={{ textShadow: "0px 4px 12px rgba(0,0,0,0.8)" }}
        >
          WE RENEW
        </h2>
      </motion.div>

      {/* Shimmer line */}
      <motion.div variants={fadeUp(0.12)}>
        <div
          className="relative w-full h-0.5 mt-2 overflow-hidden"
          style={{
            background: "linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,0.8), rgba(255,255,255,0))",
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.85) 50%, rgba(255,255,255,0) 100%)",
              animation: "shimmer 1800ms ease-in-out 500ms infinite",
              transform: "translateX(-100%)",
            }}
          />
        </div>
      </motion.div>

      {/* Tagline */}
      <motion.div variants={fadeUp(0.18)}>
        <p
          className="relative z-[1] font-thin text-[0.9rem] sm:text-[1.1rem] md:text-[1.2rem] text-[#fdfdfd] tracking-[0.1rem] sm:tracking-[0.2rem] md:tracking-[0.3rem] mt-4 sm:mt-6"
          style={{ textShadow: "0px 4px 12px rgba(0,0,0,0.8)" }}
        >
          &quot;สร้างบ้านหลังใหม่ ในที่อยู่อาศัยเดิมของคุณ&quot;
        </p>
      </motion.div>
    </motion.div>
  );
}
