import { fetchApi } from "@/shared/lib/serverApi";
import { parsePage } from "@/shared/lib/pagination";
import FurnitureListView from "./components/FurnitureListView";

export const metadata = {
  title: "Showroom - TAURUS : WE RENEW",
};

export default async function FurniturePage({ searchParams }) {
  const { type, page } = await searchParams;
  const { data } = await fetchApi("/api/furniture");
  return <FurnitureListView initialItems={data} type={type} page={parsePage(page)} />;
}
