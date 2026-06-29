"use client";

import Image from "next/image";
import { serviceItems } from "../_data/services";

const BG = "#f2e8df";
const ACC = "#b89d8b";
const BODY = "#8b7e72";

function Heading({ item, align = "left" }) {
  const textAlign =
    align === "center"
      ? "text-center"
      : align === "right"
      ? "text-right"
      : "text-left";

  return (
    <div className={`mb-6 md:mb-8 ${textAlign} text-center md:${textAlign}`}>
      <div
        className="font-bold leading-none mb-3"
        style={{
          fontSize: "clamp(4.5rem, 7.5vw, 7.5rem)",
          color: ACC,
        }}
      >
        {item.no}
      </div>
      <h6
        className="font-extrabold tracking-[.6rem] text-[1.05rem] md:text-[1.25rem]"
        style={{ color: "#4e4e4e", textIndent: ".6rem" }}
      >
        {item.title}
      </h6>
      <h6
        className="mt-1.5 font-extrabold tracking-[.12rem] text-[1.05rem] md:text-[1.2rem]"
        style={{ color: ACC }}
      >
        {item.subtitleTH}
      </h6>
    </div>
  );
}

function Image16x9({ src, alt, objectPosition = "center" }) {
  return (
    <div className="relative w-full rounded-lg overflow-hidden" style={{ paddingTop: "clamp(56.25%, 62.5%, 62.5%)" }}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 900px) 100vw, 33vw"
        className="object-cover"
        style={{ objectPosition }}
      />
    </div>
  );
}

function TextBody({ children, align = "left" }) {
  const textAlign =
    align === "center"
      ? "text-center"
      : align === "right"
      ? "text-right"
      : "text-left";

  return (
    <p
      className={`leading-[2.05] tracking-[.025rem] text-[1rem] md:text-[1.1rem] text-center md:${textAlign}`}
      style={{ color: BODY }}
    >
      {children}
    </p>
  );
}

export default function ServiceShowcase() {
  const s1 = serviceItems[0];
  const s2 = serviceItems[1];
  const s3 = serviceItems[2];

  return (
    <div
      className="w-full min-h-screen py-12 md:py-20"
      style={{ backgroundColor: BG }}
    >
      <div className="max-w-screen-xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="mb-10 md:mb-14">
          <div className="flex items-center gap-6 mb-3">
            <div className="flex-1 h-px" style={{ backgroundColor: "rgba(0,0,0,0.06)" }} />
            <h5 className="font-bold tracking-[.06em] text-center text-[1.4rem] md:text-[1.8rem] text-[#3a3a3a] whitespace-nowrap">
              บริการรีโนเวทแบบครบวงจร
            </h5>
            <div className="flex-1 h-px" style={{ backgroundColor: "rgba(0,0,0,0.06)" }} />
          </div>
          <p className="text-center tracking-[.1em] text-[1rem] md:text-[1.15rem] text-[#3a3a3a]">
            สร้างใหม่ | ปรับปรุงต่อเติม - ซ่อมแซม | ออกแบบตกแต่งภายใน
          </p>
        </div>

        {/* 3 columns */}
        <div
          className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12"
          style={{ backgroundColor: BG }}
        >
          {/* Column 1 — image below */}
          <div className="flex flex-col pr-0 md:pr-6 pb-6 md:pb-0">
            <Heading item={s1} align="left" />
            <TextBody align="left">{s1.descriptionTH}</TextBody>
            <div className="mt-6">
              <Image16x9 src={s1.image} alt={s1.title} objectPosition="left" />
            </div>
          </div>

          {/* Column 2 — image above */}
          <div className="flex flex-col px-0 md:px-6 py-6 md:py-0">
            <div className="mb-6 md:mb-14">
              <Image16x9 src={s2.image} alt={s2.title} />
            </div>
            <Heading item={s2} align="center" />
            <div className="mt-6">
              <TextBody align="center">{s2.descriptionTH}</TextBody>
            </div>
          </div>

          {/* Column 3 — image below */}
          <div className="flex flex-col pl-0 md:pl-6 pt-6 md:pt-0">
            <Heading item={s3} align="right" />
            <TextBody align="right">{s3.descriptionTH}</TextBody>
            <div className="mt-6">
              <Image16x9 src={s3.image} alt={s3.title} objectPosition="right" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
