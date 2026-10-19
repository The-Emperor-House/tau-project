import { fetchApi } from "@/shared/lib/serverApi";
import { parsePage } from "@/shared/lib/pagination";
import NewsListView from "./components/NewsListView";

export const metadata = {
  title: "News & Events - TAURUS : WE RENEW",
};

export default async function NewsPage({ searchParams }) {
  const { page } = await searchParams;
  const { data } = await fetchApi("/api/news");
  return <NewsListView initialItems={data} page={parsePage(page)} />;
}
