// next/image ย่อรูปได้เฉพาะไฟล์ในเว็บและ Cloudinary (ดู next.config.mjs) — URL ภายนอกอื่นต้องโหลดตรง
export const canOptimize = (src) =>
  typeof src === "string" && (src.startsWith("/") || src.startsWith("https://res.cloudinary.com/"));

export const photoCount = (n) => `${n} ${n === 1 ? "photo" : "photos"}`;
