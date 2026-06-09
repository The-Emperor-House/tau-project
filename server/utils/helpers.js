/**
 * ตรวจสอบว่า id เป็นจำนวนเต็มบวกหรือไม่
 * @param {any} id - ค่า id ที่จะตรวจสอบ
 * @returns {number|null} คืนค่า id ที่เป็นจำนวนเต็มบวก หรือ null ถ้าไม่ถูกต้อง
 */
const isValidId = (id) => {
  const num = Number(id);
  return Number.isInteger(num) && num > 0 ? num : null;
};

/**
 * สร้างออบเจ็กต์ข้อมูลสำหรับ update โดยกรองเฉพาะฟิลด์ที่อนุญาตและมีค่าใน body
 * @param {string[]} allowedFields - รายชื่อฟิลด์ที่อนุญาตให้ update
 * @param {object} body - ข้อมูลที่ส่งมา
 * @returns {object} ออบเจ็กต์ข้อมูลสำหรับ update
 */
const buildUpdateData = (allowedFields, body) => {
  return allowedFields.reduce((acc, field) => {
    if (body[field] !== undefined) {
      acc[field] = body[field];
    }
    return acc;
  }, {});
};

/**
 * แปลง string ของ id ที่คั่นด้วย comma เป็น array ของจำนวนเต็มบวก
 * เช่น "1, 2,3" => [1, 2, 3]
 * @param {string} idString - string ของ id คั่นด้วย comma
 * @returns {number[]} array ของ id ที่ valid
 */
const parseDeleteIds = (idString) => {
  if (typeof idString !== 'string' || !idString.trim()) return [];

  return idString
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isInteger(n) && n > 0);
};

module.exports = {
  isValidId,
  buildUpdateData,
  parseDeleteIds,
};
