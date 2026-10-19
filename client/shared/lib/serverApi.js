// ดึงข้อมูลจาก backend ใน Server Component — Next cache ผลไว้ (ISR) และสร้างใหม่ทุก REVALIDATE_SECONDS
// dashboard สั่งล้าง cache ทันทีหลังแก้ข้อมูลผ่าน /api/revalidate (revalidateTag(API_CACHE_TAG))

export const API_CACHE_TAG = "api";
const REVALIDATE_SECONDS = 60;

/**
 * @param {string} path เช่น "/api/news"
 * @returns {Promise<{ data: any, notFound?: boolean }>}
 *   data = null เมื่อดึงไม่สำเร็จ (backend ล่ม/กำลังตื่น) — ให้หน้าไปดึงเองฝั่ง client แทน
 */
export async function fetchApi(path) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
      next: { revalidate: REVALIDATE_SECONDS, tags: [API_CACHE_TAG] },
    });
    // 404 = ไม่มีข้อมูล, 400 = id ผิดรูปแบบ (เช่น /news/abc) — ทั้งคู่ถือว่าไม่พบหน้า
    if (res.status === 404 || res.status === 400) return { data: null, notFound: true };
    if (!res.ok) return { data: null };
    return { data: await res.json() };
  } catch {
    return { data: null };
  }
}
