// ประเภทงาน design — value ตรงกับ URL (/design/[type]) และ enum DesignType ฝั่ง API (ตัวพิมพ์ใหญ่)
export const DESIGN_TYPES = [
  {
    value: "architectural",
    label: "Architectural",
    title: "Architectural Design",
    subtitle: "ออกแบบสถาปัตยกรรม",
    cover: "/design/architectural-cover.webp",
  },
  {
    value: "interior",
    label: "Interior",
    title: "Interior Design",
    subtitle: "ออกแบบตกแต่งภายใน",
    cover: "/design/interior-cover.webp",
  },
];

export const findDesignType = (value) =>
  DESIGN_TYPES.find((t) => t.value === String(value).toLowerCase());
