"use client";

import { ABOUT_INTRO_TITLE, ABOUT_INTRO_TEXT } from "../_data/aboutIntro";

function Paragraphs({ text }) {
  const paras = text.trim().split(/\n\s*\n/);
  return (
    <div className="max-w-[58ch] md:max-w-[68ch] mx-auto">
      {paras.map((p, i) => (
        <p
          key={i}
          className="text-[#ab9685] tracking-[0.01rem] text-[0.95rem] sm:text-[1.05rem] md:text-[1.15rem] overflow-wrap-anywhere break-words hyphens-auto leading-relaxed"
          style={{
            marginTop: i === 0 ? "0.375rem" : 0,
            marginBottom: "1rem",
            textIndent: undefined,
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

export default function AboutIntro() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 md:py-16 text-center">
      <h5 className="text-[#cc8f2a] font-bold tracking-[0.1em] mb-4 text-lg md:text-xl">
        {ABOUT_INTRO_TITLE}
      </h5>
      <Paragraphs text={ABOUT_INTRO_TEXT} />
    </div>
  );
}
