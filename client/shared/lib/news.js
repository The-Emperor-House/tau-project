export const NEWS_FALLBACK_COVER = "/images/default-news.jpg";

export function resolveNewsUrl(u) {
  if (!u) return null;
  if (u.startsWith("https://")) return u;
  if (u.startsWith("//")) return "https:" + u;
  if (u.startsWith("http://")) return u.replace(/^http:\/\//i, "https://");
  // path ที่ขึ้นต้นด้วย "/" คือไฟล์ในเว็บ (client/public) — backend ไม่ได้เสิร์ฟไฟล์ static จึงห้ามต่อ URL ของ API
  return u;
}

export function extractNewsLabel(h1 = "") {
  const s = String(h1).trim();
  if (!s) return "NEWS :";
  if (s.includes(":")) return `${s.split(":")[0].trim().toUpperCase()} :`;
  return `${s.split(/\s+/)[0].toUpperCase()} :`;
}

export function formatNewsDate(d) {
  if (!d) return "";
  return new Date(d)
    .toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    .toUpperCase();
}

// ป้ายหมวดข่าว (ส่วนหน้า ":" ของ heading1) ไม่รวมเครื่องหมาย ":"
export function newsLabel(h1 = "") {
  return extractNewsLabel(h1).replace(/\s*:$/, "");
}
