import UserProfileCard from './components/UserProfileCard';

export default function DashboardPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* ชั้นพื้นหลัง: ไล่สีดำลงด้านล่าง */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#000]" />

      {/* ไฮไลต์ระยะแรกแบบรัศมี (ให้มิติเล็กๆ ไม่กลืน) */}
      <div className="absolute inset-0 bg-[radial-gradient(100%_60%_at_50%_0%,rgba(255,255,255,0.06),rgba(255,255,255,0)_60%)]" />

      {/* คอนเทนต์ */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <UserProfileCard />
      </div>
    </div>
  );
}
