import { cn } from "@/shared/lib/utils";

// โครงหน้าเว็บสาธารณะ: พื้นเทาเข้ม, เว้นที่ให้ navbar, ความกว้างเนื้อหาเท่ากันทุกหน้า
export default function PageShell({ children, className }) {
  return (
    <div className="bg-site-bg text-white min-h-screen pb-20 md:pb-28" style={{ paddingTop: "var(--page-top)" }}>
      <div className={cn("max-w-[1200px] mx-auto px-4 md:px-6", className)}>{children}</div>
    </div>
  );
}
