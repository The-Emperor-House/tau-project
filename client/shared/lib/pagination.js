// เลขหน้ามาจาก URL (?page=2) — ค่าที่ผิดรูปแบบถือเป็นหน้า 1
export function parsePage(value) {
  const n = Number.parseInt(Array.isArray(value) ? value[0] : value, 10);
  return Number.isInteger(n) && n > 0 ? n : 1;
}

// ตัดรายการตามหน้า — page ที่เกินจำนวนหน้าจะถูกปรับเป็นหน้าสุดท้าย
export function paginate(items, page, pageSize) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(Math.max(page, 1), totalPages);
  return {
    page: current,
    totalPages,
    pageItems: items.slice((current - 1) * pageSize, current * pageSize),
  };
}

// สร้าง query string โดยตัดค่าว่างและ page=1 ออก (URL หน้าแรกจะสะอาด)
export function buildQuery(params) {
  const q = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    if (key === "page" && Number(value) === 1) continue;
    q.set(key, String(value));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}
