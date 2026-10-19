import Link from "next/link";
import { cn } from "@/shared/lib/utils";

const button =
  "px-6 py-2.5 text-xs tracking-[0.25em] uppercase border transition-colors border-site-accent/60 text-site-accent hover:bg-site-accent hover:text-black";
const disabled = "px-6 py-2.5 text-xs tracking-[0.25em] uppercase border border-white/10 text-white/30 cursor-not-allowed";

/**
 * ปุ่มเปลี่ยนหน้า (← Previous · 2 / 5 · Next →) ชิดขวา — ใช้ร่วมกันทุกหน้ารายการ
 * hrefFor(page) คืน URL ของหน้านั้น เลขหน้าอยู่ใน URL เพื่อให้ปุ่ม back กลับมาหน้าเดิมได้
 */
export default function Pagination({ page, totalPages, hrefFor, className }) {
  if (totalPages <= 1) return null;

  const prev = page > 1;
  const next = page < totalPages;

  return (
    <nav aria-label="Pagination" className={cn("flex items-center justify-end gap-4 mt-12", className)}>
      {prev ? (
        <Link href={hrefFor(page - 1)} className={button} rel="prev">← Previous</Link>
      ) : (
        <span className={disabled} aria-disabled>← Previous</span>
      )}
      <p className="text-xs tracking-[0.2em] text-white/50" aria-current="page">
        {page} / {totalPages}
      </p>
      {next ? (
        <Link href={hrefFor(page + 1)} className={button} rel="next">Next →</Link>
      ) : (
        <span className={disabled} aria-disabled>Next →</span>
      )}
    </nav>
  );
}
