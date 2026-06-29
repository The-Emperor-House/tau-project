"use client";

import AboutUsSection from "@/app/about-us/components/AboutUsSection";

export default function AboutUsHomePageSection() {
  return (
    <section className="py-12 md:py-16">
      <div className="flex flex-col lg:flex-row justify-center lg:justify-between items-center gap-1.5 lg:gap-0 mb-4 px-2 lg:px-10">
        <h3 className="text-3xl font-thin tracking-[0.4rem] text-center lg:text-left">
          ABOUT US
        </h3>
        <p className="font-extrabold text-[#cc8f2a] tracking-[0.25rem] text-center lg:text-right text-xl sm:text-[1.35rem] md:text-[1.45rem] lg:text-[1.6rem] leading-tight lg:pr-40">
          RECRAFTING SPACES. REVIVING LIVING.
        </p>
      </div>
      <AboutUsSection />
    </section>
  );
}
