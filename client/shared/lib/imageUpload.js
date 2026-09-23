import { toast } from "sonner";

// ต้องตรงกับ MAX_IMAGES ใน server/utils/upload.js
export const MAX_IMAGES = 20;

// ย่อรูปก่อนส่ง: ด้านยาวสุดไม่เกิน 1920px (server ย่อเหลือ 1280px อยู่แล้ว คุณภาพที่เก็บจึงไม่ลดลง)
const MAX_DIMENSION = 1920;
const JPEG_QUALITY = 0.85;
// ไฟล์เล็กที่ server รับได้อยู่แล้ว ส่งไปตรง ๆ ไม่ต้องย่อ
const SKIP_BELOW_BYTES = 500 * 1024;
const SERVER_TYPES = ["image/jpeg", "image/png", "image/webp"];

const isImageFile = (file) =>
  file.type.startsWith("image/") || /\.(heic|heif)$/i.test(file.name);

async function decodeImage(file) {
  try {
    return { source: await createImageBitmap(file, { imageOrientation: "from-image" }) };
  } catch {
    // fallback ผ่าน <img> — Safari/iOS อ่าน HEIC ได้ทางนี้
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.src = url;
    try {
      await img.decode();
      return { source: img, url };
    } catch {
      URL.revokeObjectURL(url);
      throw new Error(`"${file.name}" can't be read. Please use a JPG, PNG or WEBP image.`);
    }
  }
}

/**
 * ย่อรูปใน browser แล้วแปลงเป็น JPEG ให้ไฟล์เล็กพอส่งขึ้น server ได้เร็ว
 * @param {File} file
 * @returns {Promise<File>} ไฟล์ที่ย่อแล้ว (หรือไฟล์เดิมถ้าเล็กอยู่แล้ว)
 */
export async function compressImage(file) {
  if (SERVER_TYPES.includes(file.type) && file.size <= SKIP_BELOW_BYTES) return file;

  const { source, url } = await decodeImage(file);
  try {
    const scale = Math.min(1, MAX_DIMENSION / Math.max(source.width, source.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(source.width * scale);
    canvas.height = Math.round(source.height * scale);

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff"; // JPEG ไม่มีพื้นโปร่งใส
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(source, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY));
    if (!blob) throw new Error(`"${file.name}" can't be processed. Please try another image.`);

    // ถ้าย่อแล้วไม่เล็กลงและ server รับไฟล์เดิมได้ ส่งไฟล์เดิมไป
    if (SERVER_TYPES.includes(file.type) && scale === 1 && blob.size >= file.size) return file;

    const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], name, { type: "image/jpeg", lastModified: Date.now() });
  } finally {
    source.close?.();
    if (url) URL.revokeObjectURL(url);
  }
}

/** ย่อรูปทีละรูป (ทำพร้อมกันหลายรูปจะกินแรมมากบนมือถือ) */
export async function compressImages(files) {
  const out = [];
  for (const file of files) out.push(await compressImage(file));
  return out;
}

/**
 * กรองไฟล์ที่ผู้ใช้เลือก: เอาเฉพาะรูป และไม่ให้เกิน MAX_IMAGES รวมกับรูปที่มีอยู่แล้ว
 * @param {File[]} files ไฟล์ที่เพิ่งเลือก
 * @param {number} currentCount จำนวนรูปใน gallery ตอนนี้
 * @returns {File[]} ไฟล์ที่เพิ่มได้
 */
export function pickGalleryImages(files, currentCount) {
  const images = files.filter(isImageFile);
  if (images.length < files.length) {
    toast.warning("Some files were skipped because they are not images.");
  }

  const room = Math.max(0, MAX_IMAGES - currentCount);
  if (images.length > room) {
    toast.warning(
      room === 0
        ? `This gallery already has ${MAX_IMAGES} images, the maximum allowed.`
        : `You can add up to ${MAX_IMAGES} images. Only the first ${room} were added.`
    );
  }
  return images.slice(0, room);
}

/** อ่านข้อความ error จาก response ของ server (ถ้าไม่มีใช้ fallback) */
export async function getErrorMessage(res, fallback) {
  try {
    const text = await res.text();
    try {
      return JSON.parse(text)?.message || fallback;
    } catch {
      return text && text.length < 200 ? text : fallback;
    }
  } catch {
    return fallback;
  }
}
