"use client";
import { useEffect, useState } from "react";
import ProjectCardsGrid from "../components/ProjectCardsGrid";
import AnimatedHeading from "@/shared/components/ui/AnimatedHeading";

// mock fetch (replace with real API)
const fetchProjectsData = async () =>
  new Promise((resolve) =>
    setTimeout(() => {
      resolve([
        {
          id: 1,
          title: "REBUILD",
          description: "สร้างใหม่",
          image: "/home/projects/rebuild.webp",
          link: "/projects/REBUILD",
        },
        {
          id: 2,
          title: "RENOVATE",
          description: "ปรับปรุงต่อเติม - ซ่อมแซม",
          image: "/home/projects/renovate.webp",
          link: "/projects/RENOVATE",
        },
        {
          id: 3,
          title: "REDESIGN & DECORATE",
          description: "ออกแบบตกแต่งภายใน",
          image: "/home/projects/redesign.png",
          link: "/projects/REDESIGN",
        },
      ]);
    }, 500)
  );

export default function ProjectsSection() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await fetchProjectsData();
      setProjects(data);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <>
        <AnimatedHeading
          variant="h1"
          sx={{ mb: 4 }}
          title="PROJECT"
          subtitle="RECRAFTING SPACES. REVIVING LIVING."
          align="center"
          titleColor="#ffffffff"
        />
        <div className="grid w-full p-4 sm:p-6 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))] gap-5 sm:gap-6 min-h-[60vh]">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="relative w-full aspect-[3/4] overflow-hidden rounded-2xl bg-neutral-900 animate-pulse ring-1 ring-white/10"
            />
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <AnimatedHeading
        variant="h1"
        sx={{ mb: 4 }}
        title="PROJECT"
        subtitle="RECRAFTING SPACES. REVIVING LIVING."
        align="center"
        titleColor="#ffffffff"
      />
      <ProjectCardsGrid projects={projects} className="min-h-screen" />
    </>
  );
}
