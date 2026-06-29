"use client";

import AboutHeroBanner from "./components/AboutHeroBanner";
import AboutIntro from "./components/AboutIntro";
import ServicesSummaryBar from "./components/ServicesSummaryBar";
import ServiceShowcase from "./components/ServiceShowcase";

const servicesList = ["สร้างใหม่", "ปรับปรุงต่อเติม - ซ่อมแซม", "ออกแบบตกแต่งภายใน"];
const categories = [{ name: "HOME" }, { name: "CONDOMINIUM" }, { name: "HOTEL" }, { name: "OFFICE" }];

export default function AboutUsPage() {
  return (
    <main className="w-full overflow-x-hidden">
      <section>
        <AboutHeroBanner />
      </section>

      <section>
        <AboutIntro />
      </section>

      <section>
        <ServicesSummaryBar services={servicesList} categories={categories} />
      </section>

      {/* Divider constrained to content width */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 mt-4 mb-2">
        <div className="h-px bg-black" />
      </div>

      <section>
        <ServiceShowcase />
      </section>
    </main>
  );
}
