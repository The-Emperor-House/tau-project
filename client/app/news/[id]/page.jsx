import { notFound } from "next/navigation";
import { fetchApi } from "@/shared/lib/serverApi";
import NewsDetailView from "../components/NewsDetailView";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const { data } = await fetchApi(`/api/news/${encodeURIComponent(id)}`);
  return {
    title: data ? `${data.heading2 || data.heading1} - TAURUS : WE RENEW` : "News & Events - TAURUS : WE RENEW",
    description: data?.body?.slice(0, 160),
  };
}

export default async function NewsDetailPage({ params }) {
  const { id } = await params;
  const { data, notFound: missing } = await fetchApi(`/api/news/${encodeURIComponent(id)}`);
  if (missing) notFound();
  return <NewsDetailView id={id} initialItem={data} />;
}
