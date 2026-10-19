import { notFound } from "next/navigation";
import { fetchApi } from "@/shared/lib/serverApi";
import FurnitureDetailView from "../components/FurnitureDetailView";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const { data } = await fetchApi(`/api/furniture/${encodeURIComponent(id)}`);
  return {
    title: data ? `${data.name} - TAURUS : WE RENEW` : "Showroom - TAURUS : WE RENEW",
    description: data?.details?.slice(0, 160),
  };
}

export default async function FurnitureDetailPage({ params }) {
  const { id } = await params;
  const { data, notFound: missing } = await fetchApi(`/api/furniture/${encodeURIComponent(id)}`);
  if (missing) notFound();
  return <FurnitureDetailView id={id} initialItem={data} />;
}
