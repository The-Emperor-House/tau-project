import clsx from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// ตัวอักษรไทยห้ามเว้นระยะ (letter-spacing) — สระ/วรรณยุกต์จะแยกออกจากพยัญชนะ
export function hasThai(s) {
  return /[\u0E00-\u0E7F]/.test(String(s ?? ""));
}
