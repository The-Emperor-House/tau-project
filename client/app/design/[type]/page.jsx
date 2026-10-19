import { notFound } from "next/navigation";
import { fetchApi } from "@/shared/lib/serverApi";
import { parsePage } from "@/shared/lib/pagination";
import DesignTypeView from "../components/DesignTypeView";
import { findDesignType } from "../designTypes";

export async function generateMetadata({ params }) {
  const { type } = await params;
  const designType = findDesignType(type);
  return { title: `${designType?.title ?? "Design"} - TAURUS : WE RENEW` };
}

export default async function DesignTypePage({ params, searchParams }) {
  const { type } = await params;
  const { page } = await searchParams;
  const designType = findDesignType(type);
  if (!designType) notFound();

  const { data } = await fetchApi(`/api/designs?type=${designType.value.toUpperCase()}`);
  return <DesignTypeView type={designType.value} initialItems={data} page={parsePage(page)} />;
}
