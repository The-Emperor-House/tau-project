"use client";

import { useEffect, useState } from "react";
import InfoCard, { InfoCardSkeleton } from "@/shared/components/site/InfoCard";
import Lightbox from "@/shared/components/site/Lightbox";
import Pagination from "@/shared/components/site/Pagination";
import { paginate, buildQuery } from "@/shared/lib/pagination";
import { findProjectType } from "../projectTypes";

const PAGE_SIZE = 9;

const galleryOf = (project) =>
  [project?.coverUrl, ...(project?.images?.map((img) => img.imageUrl) || [])].filter(Boolean);

// initialProjects มาจาก server (page.jsx) — ถ้าเป็น null แปลว่า server ดึงไม่สำเร็จ ให้ดึงเองฝั่ง client
// page มาจาก ?page= ใน URL
export default function ProjectTypeView({ type, initialProjects = null, page: requestedPage = 1 }) {
  const [projects, setProjects] = useState(() => (Array.isArray(initialProjects) ? initialProjects : []));
  const [loading, setLoading] = useState(initialProjects == null);
  const [selected, setSelected] = useState(null);

  const projectType = findProjectType(type);
  const { page, totalPages, pageItems } = paginate(projects, requestedPage, PAGE_SIZE);

  useEffect(() => {
    if (initialProjects != null) return;
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects?type=${String(type).toUpperCase()}`);
        const data = res.ok ? await res.json() : [];
        if (alive) setProjects(Array.isArray(data) ? data : []);
      } catch {
        if (alive) setProjects([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [type, initialProjects]);

  return (
    <div className="relative min-h-screen bg-site-bg text-white">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 pb-16 md:pb-24" style={{ paddingTop: "var(--page-top)" }}>
        {/* Header */}
        <div className="flex justify-center mb-8 md:mb-14">
          <div className="grid grid-cols-1 sm:grid-cols-[auto_auto] justify-items-center sm:justify-items-start items-end gap-x-6 md:gap-x-10 gap-y-2 sm:gap-y-0">
            <span className="font-light text-site-accent tracking-[.08em] sm:tracking-[.2em] md:tracking-[.24em] text-[2.2rem] sm:text-[3.4rem] md:text-[5.5rem] lg:text-[6.5rem] leading-none uppercase whitespace-nowrap">
              Project
            </span>
            <div className="flex flex-col justify-center items-center sm:items-start gap-1 md:gap-2 pb-1 md:pb-3 sm:pl-6 md:pl-10 sm:border-l sm:border-white/15">
              <span className="text-white font-light tracking-[.18em] sm:tracking-[.4em] md:tracking-[.48em] text-[1.1rem] sm:text-[1.4rem] md:text-[2rem] leading-tight uppercase text-center sm:text-left">
                {projectType?.label ?? type}
              </span>
              <span className="text-site-accent/90 font-light tracking-[.14em] sm:tracking-[.36em] md:tracking-[.42em] text-[0.8rem] sm:text-[0.95rem] md:text-[1.1rem] leading-tight uppercase text-center sm:text-left">
                Portfolio
              </span>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8 lg:gap-10 items-stretch">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <InfoCardSkeleton key={i} />)
            : projects.length === 0
            ? (
                <p className="col-span-full py-24 text-center text-white/50 text-sm tracking-[0.15em]">ไม่พบโปรเจกต์</p>
              )
            : pageItems.map((project, i) => (
                <InfoCard
                  key={project.id}
                  onClick={() => setSelected(project)}
                  image={project.coverUrl || project.images?.[0]?.imageUrl}
                  alt={project.name}
                  priority={i < 3}
                >
                  <h2 className="text-white text-[1.05rem] md:text-[1.1rem] font-medium leading-snug">{project.name}</h2>
                  {project.details && (
                    <p className="mt-2 text-white/60 text-[0.95rem] leading-[1.75] whitespace-pre-line line-clamp-6">
                      {project.details}
                    </p>
                  )}
                  {typeof project.areaSize === "number" && (
                    <p className="mt-4 text-site-accent text-[0.95rem] tracking-wide">
                      พื้นที่ใช้สอย <span className="text-lg font-medium">{project.areaSize.toLocaleString("th-TH")}</span> ตรม.
                    </p>
                  )}
                </InfoCard>
              ))}
        </div>

        {!loading && (
          <Pagination page={page} totalPages={totalPages} hrefFor={(p) => `/projects/${type}${buildQuery({ page: p })}`} />
        )}
      </div>

      <Lightbox
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        images={galleryOf(selected)}
        title={selected?.name}
        caption={selected?.details}
      />
    </div>
  );
}
