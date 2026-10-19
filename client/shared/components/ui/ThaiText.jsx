import { Fragment } from "react";

/**
 * จัดคำภาษาไทย: ไม่ให้ตัดบรรทัดกลางวลีสั้น เช่น "ต่อ | เติม" หรือ "ภาย | ใต้"
 * (ภาษาไทยเว้นวรรคระหว่างวลีอยู่แล้ว จึงตัดตรงช่องว่างได้เป็นธรรมชาติ)
 *
 * วลีที่ยาวกว่า maxPhrase ตัวอักษรปล่อยให้เบราว์เซอร์ตัดตามขอบเขตคำได้ตามปกติ —
 * ถ้าบังคับวลียาวไม่ให้ตัด คอลัมน์แคบจะมีขอบขวาแหว่งมาก
 * ใช้กับข้อความที่เป็น string เท่านั้น อย่างอื่นส่งผ่านตามเดิม
 */
export default function ThaiText({ children, maxPhrase = 18 }) {
  if (typeof children !== "string") return children;

  return children
    .trim()
    .split(/\s+/)
    .map((phrase, i) => (
      <Fragment key={i}>
        {i > 0 && " "}
        {phrase.length <= maxPhrase ? <span className="inline-block">{phrase}</span> : phrase}
      </Fragment>
    ));
}
