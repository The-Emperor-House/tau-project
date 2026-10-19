"use client";
import ProjectCardsGrid from "../components/ProjectCardsGrid";
import AnimatedHeading from "@/shared/components/ui/AnimatedHeading";
import { PROJECT_TYPES } from "../projectTypes";

// ข้อมูลคงที่ — แสดงทันทีไม่ต้องรอโหลด
const projects = PROJECT_TYPES.map((t) => ({
  id: t.value,
  title: t.title.toUpperCase(),
  description: t.subtitle,
  image: t.cover,
  link: `/projects/${t.value}`,
}));

export default function ProjectsSection() {
  return (
    <>
      <AnimatedHeading
        variant="h1"
        className="mb-4"
        title="PROJECT"
        subtitle="RECRAFTING SPACES. REVIVING LIVING."
        align="center"
        titleColor="#ffffffff"
      />
      <ProjectCardsGrid projects={projects} className="min-h-screen" />
    </>
  );
}
