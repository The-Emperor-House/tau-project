"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import AboutBlock from "./AboutBlock";
import ServiceBlock from "./ServiceBlock";
import IconListBlock from "./IconListBlock";

const servicesList = ["สร้างใหม่", "ปรับปรุงต่อเติม - ซ่อมแซม", "ออกแบบตกแต่งภายใน"];
const categories = ["HOME", "CONDOMINIUM", "HOTEL", "OFFICE"];

const fadeInUpVariant = {
  hidden: { opacity: 0, y: 50 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      type: "spring",
      stiffness: 80,
      damping: 15,
      duration: 1.0,
      ease: [0.2, 0.65, 0.3, 0.9],
    },
  }),
};

export default function AboutUsSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 md:px-8 lg:px-16">
      {/* 1) ABOUT */}
      <div className="relative">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUpVariant}
          custom={1}
          className="w-full h-full"
        >
          <AboutBlock />
        </motion.div>
        <div className="hidden md:block absolute right-[-12px] top-0 h-full w-px bg-black/20" />
      </div>

      {/* 2) SERVICE */}
      <div className="relative">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUpVariant}
          custom={2}
          className="w-full h-full"
        >
          <ServiceBlock />
        </motion.div>
      </div>

      {/* 3) ICON LIST */}
      <div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUpVariant}
          custom={3}
          className="w-full h-full"
        >
          <IconListBlock />
        </motion.div>
      </div>

      {/* BOTTOM TEXT + READ MORE */}
      <div className="md:col-span-3 mt-26">
        <div className="flex flex-col md:flex-row items-center justify-center md:justify-between gap-4 text-center md:text-left">
          <div className="w-full">
            <p className="font-medium tracking-[0.05rem] text-[0.8rem] sm:text-[1rem] md:text-[1.2rem] md:ml-6 mb-1 break-words" style={{ wordBreak: "break-word" }}>
              {servicesList.join(" | ")}
            </p>
            <p className="font-light text-black tracking-[0.05rem] text-[0.95rem] sm:text-[1rem] md:text-[1.2rem] opacity-80 md:ml-12 break-words" style={{ wordBreak: "break-word" }}>
              {categories.join(" | ")}
            </p>
          </div>

          <Link
            href="/about-us"
            className="inline-flex items-center px-7 py-2.5 rounded-full font-extrabold tracking-[0.25rem] uppercase text-white transition-colors shrink-0 mt-2 md:mt-0"
            style={{ backgroundColor: "#ab9685" }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#9b8575")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#ab9685")}
          >
            READ&nbsp;MORE
          </Link>
        </div>
      </div>
    </div>
  );
}
