'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import ProfileSheet from '@/app/profile/components/ProfileSheet';

const NAV = [
  { href: '/dashboard/design', label: 'Design', icon: DesignIcon },
  { href: '/dashboard/project', label: 'Projects', icon: ProjectIcon },
  { href: '/dashboard/furniture', label: 'Showroom', icon: FurnitureIcon },
  { href: '/dashboard/news', label: 'News & Events', icon: NewsIcon },
  { href: '/dashboard/contact', label: 'Contacts', icon: ContactIcon },
  { href: '/dashboard/users', label: 'Users', icon: UsersIcon },
];

const ACCENT = '#cc8f2a';

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/auth/login');
  };

  return (
    <div className="flex h-screen bg-[#0a0a0a] overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-30 w-60 flex flex-col
        border-r border-neutral-800/60 bg-[#111111]
        transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 lg:z-auto
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-neutral-800/60">
          <Image src="/logo/LOGO NEW TAURUS WHITE.png" alt="Taurus" width={32} height={32} />
          <div>
            <p className="text-white text-sm font-bold tracking-widest uppercase leading-none">Taurus</p>
            <p className="text-[10px] tracking-widest uppercase mt-0.5" style={{ color: ACCENT }}>Dashboard</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group ${
                  active
                    ? 'text-white font-medium'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
                style={active ? { background: `${ACCENT}18`, color: ACCENT } : {}}
              >
                <Icon className={`w-4 h-4 shrink-0 ${active ? '' : 'group-hover:text-white'}`}
                  style={active ? { color: ACCENT } : {}} />
                {label}
                {active && <div className="ml-auto w-1 h-1 rounded-full" style={{ background: ACCENT }} />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: user + logout */}
        <div className="px-3 py-4 border-t border-neutral-800/60 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-neutral-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <HomeIcon className="w-4 h-4 shrink-0" />
            หน้าหลัก
          </Link>
          <button
            onClick={() => setProfileOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-neutral-400 hover:text-white hover:bg-white/5 transition-all text-left"
          >
            <div className="w-7 h-7 rounded-full bg-neutral-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-white text-xs font-medium truncate">{session?.user?.name || 'User'}</p>
              <p className="text-neutral-500 text-[10px] truncate">{session?.user?.email || ''}</p>
            </div>
          </button>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
          >
            <LogoutIcon className="w-4 h-4 shrink-0" />
            ออกจากระบบ
          </button>
        </div>
      </aside>

      <ProfileSheet open={profileOpen} onClose={() => setProfileOpen(false)} />

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-4 px-5 h-14 border-b border-neutral-800/60 bg-[#111111] shrink-0">
          <button
            className="lg:hidden p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-all"
            onClick={() => setSidebarOpen((o) => !o)}
          >
            <MenuIcon className="w-5 h-5" />
          </button>
          <span className="text-sm text-neutral-400 truncate">
            {NAV.find((n) => pathname.startsWith(n.href))?.label || 'Dashboard'}
          </span>
          <div className="ml-auto flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors hidden sm:block"
            >
              ← กลับหน้าหลัก
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

/* ── Icons ── */
function FurnitureIcon({ className, style }) {
  return <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-4 0v2M8 21v-4M16 21v-4" /></svg>;
}
function DesignIcon({ className, style }) {
  return <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>;
}
function ProjectIcon({ className, style }) {
  return <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M9 22V12h6v10" /></svg>;
}
function NewsIcon({ className, style }) {
  return <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10l6 6v8a2 2 0 0 1-2 2z" /><path d="M15 4v6h6M9 12h6M9 16h4" /></svg>;
}
function ContactIcon({ className, style }) {
  return <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" /><rect x="9" y="3" width="6" height="4" rx="1" /><path d="M9 12h6M9 16h4" /></svg>;
}
function UsersIcon({ className, style }) {
  return <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
}
function HomeIcon({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M9 22V12h6v10" /></svg>;
}
function LogoutIcon({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>;
}
function MenuIcon({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 12h18M3 6h18M3 18h18" /></svg>;
}
