"use client";

export default function AboutHeroBanner() {
  return (
    <div
      className="relative w-full flex items-center justify-center text-white text-center"
      style={{
        height: "clamp(48vh, 50vh, 50vh)",
        backgroundImage: "url('/about-us/banner.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/50 z-[1]" />
      <div
        className="relative z-[2] flex flex-col items-center px-4"
        style={{ paddingTop: "var(--nav-h)" }}
      >
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-[0.05em]">
          ABOUT US
        </h1>
        <p className="font-bold uppercase tracking-[0.2em] mt-2 text-[#cc8f2a] text-2xl sm:text-3xl md:text-4xl">
          RECRAFTING SPACE.
          <br />
          REVIVING LIVING.
        </p>
        <p className="font-light text-white tracking-[0.1em] mt-4 max-w-[600px] text-sm sm:text-base md:text-xl">
          &quot;สร้างบ้านหลังใหม่ ในที่อยู่อาศัยเดิมของคุณ&quot;
        </p>
      </div>
    </div>
  );
}
