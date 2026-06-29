import { ABOUT_INTRO_TEXT } from "../_data/aboutIntro";

function Paragraphs({ text }) {
  const paras = text.trim().split(/\n\s*\n/);
  return (
    <div className="max-w-[58ch] md:max-w-[68ch] mx-auto">
      {paras.map((p, i) => (
        <p
          key={i}
          className="text-[#111] leading-[1.85] tracking-[0.01rem] text-[0.95rem] sm:text-[1.05rem] md:text-[1.15rem] break-words hyphens-auto"
          style={{
            marginTop: i === 0 ? "0.375rem" : 0,
            marginBottom: "1rem",
            WebkitHyphens: "auto",
            textWrap: "pretty",
            WebkitFontSmoothing: "antialiased",
          }}
        >
          {p}
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
      <p className="text-center mt-4 text-black tracking-[0.2rem] text-[0.8rem] sm:text-base md:text-[1.2rem]">
        &quot;สร้างบ้านหลังใหม่ ในที่อยู่อาศัยเดิมของคุณ&quot;
      </p>
      <Paragraphs text={ABOUT_INTRO_TEXT} />
    </div>
  );
}
