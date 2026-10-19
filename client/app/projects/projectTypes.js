// ประเภทโปรเจกต์ — value ตรงกับ URL (/projects/[type]) และ enum WorkType ฝั่ง API (ตัวพิมพ์ใหญ่)
export const PROJECT_TYPES = [
  {
    value: "rebuild",
    label: "Rebuild",
    title: "Rebuild",
    subtitle: "สร้างใหม่",
    cover: "/home/projects/rebuild.webp",
  },
  {
    value: "renovate",
    label: "Renovate",
    title: "Renovate",
    subtitle: "ปรับปรุงต่อเติม - ซ่อมแซม",
    cover: "/home/projects/renovate.webp",
  },
  {
    value: "redesign",
    label: "Redesign",
    title: "Redesign & Decorate",
    subtitle: "ออกแบบตกแต่งภายใน",
    cover: "/home/projects/redesign.webp",
  },
];

export const findProjectType = (value) =>
  PROJECT_TYPES.find((t) => t.value === String(value).toLowerCase());
