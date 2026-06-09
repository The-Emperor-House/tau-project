"use client";

import { Box, Container } from "@mui/material";

import AboutHeroBanner from "./components/AboutHeroBanner";
import AboutIntro from "./components/AboutIntro";
import ServicesSummaryBar from "./components/ServicesSummaryBar";
import ServiceShowcase from "./components/ServiceShowcase";

const servicesList = ["สร้างใหม่", "ปรับปรุงต่อเติม - ซ่อมแซม", "ออกแบบตกแต่งภายใน"];
const categories = [{ name: "HOME" }, { name: "CONDOMINIUM" }, { name: "HOTEL" }, { name: "OFFICE" }];

export default function AboutUsPage() {
  return (
    <main style={{ width: "100%", overflowX: "hidden" }}>
      {/* Top Hero(s) */}
      <section>
        <AboutHeroBanner />
      </section>

      {/* SECTION 1: Intro */}
      <section>
        <AboutIntro />
      </section>

      {/* SECTION 2: Summary Bar */}
      <section>
        <ServicesSummaryBar services={servicesList} categories={categories} />
      </section>

      {/* Divider (ความกว้างเท่าคอนเทนต์) */}
      <Container maxWidth="lg" sx={{ mt: 4, mb: 2 }}>
        <Box sx={{ height: 1, bgcolor: "rgba(0, 0, 0, 1)" }} />
      </Container>

      {/* SECTION 3: Showcase */}
      <section>
        <ServiceShowcase />
      </section>
    </main>
  );
}
