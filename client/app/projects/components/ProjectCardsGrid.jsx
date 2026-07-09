"use client";
import ProjectCard from "./ProjectCard";
import { cn } from "@/shared/lib/cn";


export default function ProjectCardsGrid({ projects, className }) {
return (
<div className={cn("grid w-full p-4 sm:p-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6", className)}>
{projects.map((p) => (
<ProjectCard key={p.id} title={p.title} description={p.description} imageSrc={p.image} href={p.link} />
))}
</div>
);
}