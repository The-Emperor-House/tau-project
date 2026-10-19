// สั่งให้หน้าเว็บสาธารณะแสดงข้อมูลใหม่ทันทีหลัง dashboard แก้ข้อมูล
// ถ้าเรียกไม่สำเร็จก็ไม่เป็นไร — cache ฝั่ง server จะหมดอายุเองภายใน 60 วินาที
export function revalidatePublicPages() {
  fetch("/api/revalidate", { method: "POST" }).catch(() => {});
}
