"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import GridCard from "../components/GridCard";
import GalleryModal from "../components/GalleryModal";

export default function TypePage() {
  const { type } = useParams();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    if (!type) {
      setLoading(false);
      setProjects([]);
      return;
    }
    const load = async () => {
      setLoading(true);
      try {
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/projects?type=${String(type).toUpperCase()}`;
        const res = await fetch(apiUrl);
        const json = await res.json();
        if (Array.isArray(json)) setProjects(json);
        else if (json && Array.isArray(json.data)) setProjects(json.data);
        else setProjects([]);
      } catch {
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [type]);

  return (
    <div className="relative min-h-screen bg-[#404040] text-[#E7D6C6]">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 pb-10 md:pb-16" style={{ paddingTop: "var(--page-top)" }}>
        {/* Header */}
        <div className="flex justify-center mb-6 md:mb-10 px-0 md:px-2">
          <div className="grid grid-cols-1 sm:grid-cols-[auto_auto] justify-items-center sm:justify-items-start items-end gap-x-6 md:gap-x-10 gap-y-2 sm:gap-y-0">
            <span className="font-bold text-[#BFA68A] tracking-[.08em] sm:tracking-[.20em] md:tracking-[.24em] lg:tracking-[.26em] text-[2.2rem] sm:text-[3.4rem] md:text-[6rem] lg:text-[7rem] xl:text-[7.6rem] leading-none uppercase whitespace-nowrap">
              PROJECT
            </span>
            <div className="flex flex-col justify-center items-center sm:items-start gap-1 md:gap-2 pb-1 md:pb-2">
              <span className="text-white font-light tracking-[.18em] sm:tracking-[.42em] md:tracking-[.50em] lg:tracking-[.56em] text-[1.1rem] sm:text-[1.4rem] md:text-[2.1rem] lg:text-[2.35rem] leading-tight uppercase text-center sm:text-left">
                {(typeof type === "string" ? type : "").toUpperCase()}
              </span>
              <span className="text-[#BFA68A] font-light tracking-[.14em] sm:tracking-[.36em] md:tracking-[.40em] lg:tracking-[.44em] text-[0.85rem] sm:text-[1rem] md:text-[1.15rem] lg:text-[1.3rem] leading-tight uppercase opacity-95 text-center sm:text-left">
                PORTFOLIO
              </span>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8 lg:gap-10 items-stretch">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i}>
                  <div className="relative w-full pt-[75%] bg-white/8 animate-pulse" />
                  <div className="mt-3 mx-auto h-6 w-[70%] bg-white/8 animate-pulse" />
                </div>
              ))
            : projects.map((project, i) => (
                <div key={project.id ?? i} className="flex flex-col">
                  <GridCard data={project} onClick={() => setSelectedProject(project)} />
                </div>
              ))}
        </div>
      </div>

      {selectedProject && (
        <GalleryModal open onClose={() => setSelectedProject(null)} data={selectedProject} />
      )}
    </div>
  );
}
