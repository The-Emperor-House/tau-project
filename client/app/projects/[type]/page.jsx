import { notFound } from "next/navigation";
import { fetchApi } from "@/shared/lib/serverApi";
import { parsePage } from "@/shared/lib/pagination";
import ProjectTypeView from "../components/ProjectTypeView";
import { findProjectType } from "../projectTypes";

export async function generateMetadata({ params }) {
  const { type } = await params;
  const projectType = findProjectType(type);
  return { title: `${projectType?.title ?? "Projects"} - TAURUS : WE RENEW` };
}

export default async function ProjectTypePage({ params, searchParams }) {
  const { type } = await params;
  const { page } = await searchParams;
  const projectType = findProjectType(type);
  if (!projectType) notFound();

  const { data } = await fetchApi(`/api/projects?type=${projectType.value.toUpperCase()}`);
  return <ProjectTypeView type={projectType.value} initialProjects={data} page={parsePage(page)} />;
}
