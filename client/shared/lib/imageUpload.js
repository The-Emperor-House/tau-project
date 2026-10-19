// ตัวช่วยอัปโหลดรูปจาก dashboard
// - ย่อรูปฝั่ง browser ก่อนส่ง: รูปมือถือ 4-10MB เหลือราว 0.3-0.8MB อัปโหลดเร็วขึ้นมาก
//   และไม่ติดลิมิตขนาดไฟล์ของ server (server ย่อเหลือกว้าง 1280px อยู่แล้ว ส่งเกิน 2048px ไปก็เปล่าประโยชน์)
// - อ่านข้อความ error จาก API มาแสดง แทนที่จะขึ้นแค่ "Failed to submit"

// ต้องตรงกับ MAX_GALLERY_IMAGES ฝั่ง server (server/utils/cloudinary.js)
export const MAX_IMAGES_PER_UPLOAD = 30;

const MAX_DIMENSION = 2048;
const JPEG_QUALITY = 0.85;
const SKIP_BELOW_BYTES = 500 * 1024;

export async function compressImage(file) {
  if (!file?.type?.startsWith("image/") || file.type === "image/gif" || file.size <= SKIP_BELOW_BYTES) {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff"; // JPEG ไม่มีพื้นโปร่งใส
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY));
    if (!blob || blob.size >= file.size) return file;

    const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], name, { type: "image/jpeg", lastModified: file.lastModified });
  } catch {
    // browser decode ไม่ได้ (เช่น HEIC บน Chrome) → ส่งไฟล์เดิม ให้ server แจ้งเหตุผลกลับมา
    return file;
  }
}

/**
 * ส่งฟอร์มที่มีรูปพร้อมรายงานความคืบหน้า: ย่อรูป → อัปโหลด (มี %) → รอ server บันทึก
 * ใช้ XMLHttpRequest เพราะ fetch ยังรายงานความคืบหน้าของการอัปโหลดไม่ได้
 *
 * @param {object} opts
 * @param {string} opts.url
 * @param {string} opts.method "POST" | "PUT"
 * @param {string} [opts.token] backend access token
 * @param {Record<string, string|undefined|null>} [opts.fields] ฟิลด์ข้อความ (ค่า undefined/null จะไม่ถูกส่ง)
 * @param {File} [opts.cover]
 * @param {File[]} [opts.images]
 * @param {(status: { message: string, progress: number|null }) => void} [opts.onStatus]
 * @returns {Promise<{ ok: boolean, status: number, data: any, message?: string }>}
 */
export async function submitImageForm({ url, method, token, fields = {}, cover, images = [], onStatus }) {
  // ย่อทีละรูป ไม่ทำพร้อมกัน — decode รูปใหญ่หลายรูปพร้อมกันทำให้มือถือ memory เต็มได้
  const files = cover ? [cover, ...images] : images;
  const optimized = [];
  for (let i = 0; i < files.length; i++) {
    onStatus?.({ message: `Optimizing images ${i + 1}/${files.length}...`, progress: null });
    optimized.push(await compressImage(files[i]));
  }

  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined && value !== null) form.append(key, value);
  }
  if (cover) form.append("cover", optimized[0]);
  optimized.slice(cover ? 1 : 0).forEach((file) => form.append("images", file));

  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    // server stream ไฟล์ขึ้น Cloudinary ระหว่างรับ % จึงสะท้อนการอัปโหลดขึ้น Cloudinary ด้วย
    // ส่งครบ 100% แล้วยังต้องรอ server บันทึก DB อีกเล็กน้อย
    xhr.upload.onprogress = (e) => {
      if (!e.lengthComputable) return;
      const percent = Math.round((e.loaded / e.total) * 100);
      onStatus?.(percent < 100
        ? { message: `Uploading... ${percent}%`, progress: percent }
        : { message: "Saving...", progress: null });
    };
    xhr.upload.onload = () => onStatus?.({ message: "Saving...", progress: null });

    xhr.onload = () => {
      let data = null;
      try { data = JSON.parse(xhr.responseText); } catch { /* body ไม่ใช่ JSON */ }
      resolve({
        ok: xhr.status >= 200 && xhr.status < 300,
        status: xhr.status,
        data,
        message: data?.message,
      });
    };
    xhr.onerror = () =>
      resolve({ ok: false, status: 0, data: null, message: "Network error — please check your connection and try again" });

    if (files.length) onStatus?.({ message: "Uploading... 0%", progress: 0 });
    xhr.send(form);
  });
}
