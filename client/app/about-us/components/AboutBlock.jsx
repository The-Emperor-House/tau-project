import ThaiText from "@/shared/components/ui/ThaiText";
import { ABOUT_INTRO_TEXT } from "../_data/aboutIntro";

function Paragraphs({ text }) {
  const paras = text.trim().split(/\n\s*\n/);
  return (
    <div className="max-w-[58ch] md:max-w-[68ch] mx-auto">
      {paras.map((p, i) => (
        <p
          key={i}
          className="text-[#111] leading-[1.85] text-[0.95rem] sm:text-[1.05rem] md:text-[1.1rem]"
          style={{
            marginTop: i === 0 ? "0.75rem" : 0,
            marginBottom: "1rem",
            textWrap: "pretty",
            WebkitFontSmoothing: "antialiased",
          }}
        >
          <ThaiText>{p}</ThaiText>
        </p>
      ))}
    </div>
  );
}

export default function AboutBlock() {
  return (
    <div className="text-center md:text-left max-w-[700px] md:max-w-none mx-auto md:pl-6">
      <p className="text-[#cc8f2a] font-bold tracking-[0.2rem] text-[1.2rem] sm:text-[1.5rem] md:text-[2rem]">
        TAURUS :
      </p>
      <p className="text-black font-bold tracking-[0.1rem] uppercase text-[1.2rem] sm:text-[1.5rem] md:text-[2rem] -mt-1">
        WE RENEW
      </p>
      {/* ภาษาไทยห้ามเว้นระยะตัวอักษร — สระ/วรรณยุกต์จะลอยแยกจากพยัญชนะ */}
      <p className="text-center mt-4 text-black font-medium text-[0.95rem] sm:text-base md:text-[1.15rem]" style={{ textWrap: "balance" }}>
        <ThaiText maxPhrase={40}>&quot;สร้างบ้านหลังใหม่ ในที่อยู่อาศัยเดิมของคุณ&quot;</ThaiText>
      </p>
      <Paragraphs text={ABOUT_INTRO_TEXT} />
    </div>
  );
}
