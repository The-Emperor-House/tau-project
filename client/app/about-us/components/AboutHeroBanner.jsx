"use client";

import Image from "next/image";

export default function AboutHeroBanner() {
  return (
    // minHeight (ไม่ใช่ height) — จอเตี้ย เช่น laptop 1366×650 เนื้อหาสูงกว่า 50vh ข้อความจะล้นออกนอกรูป
    <div
      className="relative w-full flex items-center justify-center text-white text-center pb-10 md:pb-12"
      style={{ minHeight: "50vh" }}
    >
      <Image
        src="/about-us/banner.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-black/50 z-[1]" />
      <div
        className="relative z-[2] flex flex-col items-center px-4"
        style={{ paddingTop: "var(--page-top)" }}
      >
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-[0.05em]">
          ABOUT US
        </h1>
        <p className="font-bold uppercase tracking-[0.2em] mt-2 text-[#cc8f2a] text-2xl sm:text-3xl md:text-4xl">
          RECRAFTING SPACE.
          <br />
          REVIVING LIVING.
        </p>
        <p className="font-light text-white mt-4 max-w-[600px] text-sm sm:text-base md:text-xl">
          &quot;สร้างบ้านหลังใหม่ ในที่อยู่อาศัยเดิมของคุณ&quot;
        </p>
      </div>
    </div>
  );
}
