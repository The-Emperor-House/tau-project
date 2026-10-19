import HomeCard from "@/app/home/components/HomeCards";
import AboutUsCards from "@/app/home/components/AboutUsCards";
import ProjectCards from "@/app/home/components/ProjectCards";
import NewsCards from "@/app/home/components/NewsCards";
import MapCards from "@/app/home/components/MapCards";
import { fetchApi } from "@/shared/lib/serverApi";

export const metadata = {
  title: "Home - TAURUS : WE RENEW",
  description:
    "Welcome to Taurus, your partner in interior design, renovation, and custom furniture.",
};

// ข่าวที่ปักหมุดไว้หน้าแรก ถ้าไม่มีให้ใช้ข่าวล่าสุดแทน
// คืน undefined เมื่อดึงไม่สำเร็จ เพื่อให้ NewsCards ไปดึงเองฝั่ง client
async function getHomeNews() {
  const featured = await fetchApi("/api/news?featured=true&limit=1");
  if (featured.data === null) return undefined;
  if (featured.data.length) return featured.data[0];

  const latest = await fetchApi("/api/news?limit=1");
  if (latest.data === null) return undefined;
  return latest.data[0] ?? null;
}

export default async function HomePage() {
  const homeNews = await getHomeNews();

  return (
    <main>
      <HomeCard />
      <AboutUsCards />
      <ProjectCards />
      <NewsCards initialNews={homeNews} />
      <MapCards />
    </main>
  );
}
