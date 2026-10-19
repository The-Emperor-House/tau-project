export const FURNITURE_TYPES = [
  { value: "BUILT_IN", label: "Built-in" },
  { value: "LOOSE", label: "Loose" },
  { value: "CUSTOM", label: "Custom" },
];

export const furnitureTypeLabel = (type) =>
  FURNITURE_TYPES.find((t) => t.value === type)?.label ?? type ?? "";

// แสดงเฉพาะด้านที่มีค่า (ข้อมูลบางรายการบันทึกด้านที่ไม่มีเป็น 0 เช่น ภาพเขียน)
export const formatDimensions = ({ width, depth, height } = {}) => {
  const parts = [["W", width], ["D", depth], ["H", height]]
    .filter(([, n]) => typeof n === "number" && n > 0)
    .map(([k, n]) => `${k}${n}`);
  return parts.length ? `${parts.join(" × ")} cm` : "";
};

export const formatPrice = (price) =>
  typeof price === "number" ? `${price.toLocaleString("th-TH")} บาท` : "";
