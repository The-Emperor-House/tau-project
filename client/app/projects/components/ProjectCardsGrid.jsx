"use client";
import ProjectCard from "./ProjectCard";
import { cn } from "@/shared/lib/cn";


export default function ProjectCardsGrid({ projects, className }) {
return (
<div className={cn("grid w-full p-4 sm:p-6 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))] gap-5 sm:gap-6", className)}>
{projects.map((p) => (
<ProjectCard key={p.id} title={p.title} description={p.description} imageSrc={p.image} href={p.link} />
))}
</div>
);
}