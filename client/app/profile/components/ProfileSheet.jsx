'use client';

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Sheet, SheetContent } from "@/shared/components/ui/sheet";
import EditProfileDialog from "./EditProfileDialog";
import EditAvatarDialog from "./EditAvatarDialog";
import ChangePasswordDialog from "./ChangePasswordDialog";

export default function ProfileSheet({ open, onClose }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);

  useEffect(() => {
    if (!open || status !== "authenticated") return;
    let mounted = true;
    setUser(null);
    setError(null);

    (async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${session?.backendToken}` },
        });
        if (res.status === 401) { signOut(); return; }
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (mounted) {
          if (!data?.data?.user) throw new Error();
          setUser(data.data.user);
        }
      } catch {
        if (mounted) setError("ไม่สามารถโหลดข้อมูลผู้ใช้ได้");
      }
    })();

    return () => { mounted = false; };
  }, [open, session, status]);

  const isLoading = status === "loading" || (status === "authenticated" && !user && !error);
  const initials = user?.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <>
      <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
        <SheetContent
          side="right"
          className="w-[min(85vw,380px)] p-0 bg-[#111] border-l border-neutral-800 overflow-y-auto"
        >
          {/* Header band */}
          <div className="relative h-24 w-full shrink-0" style={{ background: 'linear-gradient(135deg, #1a1408 0%, #111 60%)' }}>
            <div className="absolute inset-0 opacity-[0.04]"
              style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #cc8f2a 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          </div>

          <div className="px-6 pb-8 -mt-12 flex flex-col items-center relative">
            {isLoading ? (
              <>
                <div className="w-24 h-24 rounded-full bg-neutral-800 animate-pulse ring-4 ring-[#111] mb-4" />
                <div className="h-5 w-36 bg-neutral-800 rounded animate-pulse mb-2" />
                <div className="h-4 w-48 bg-neutral-800 rounded animate-pulse mb-6" />
                <div className="w-full space-y-3">
                  <div className="h-4 w-full bg-neutral-800 rounded animate-pulse" />
                  <div className="h-4 w-4/5 bg-neutral-800 rounded animate-pulse" />
                </div>
              </>
            ) : error ? (
              <div className="mt-12 text-center">
                <p className="text-rose-400 text-sm">{error}</p>
              </div>
            ) : user ? (
              <>
                {/* Avatar */}
                <button
                  onClick={() => setAvatarOpen(true)}
                  className="group relative w-24 h-24 rounded-full ring-4 ring-[#111] overflow-hidden shrink-0 mb-4"
                >
                  {user.avatarUrl
                    ? <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                    : (
                      <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-white"
                        style={{ background: 'linear-gradient(135deg, #2a1f08, #3d2c0a)' }}>
                        {initials}
                      </div>
                    )
                  }
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <CameraIcon />
                  </div>
                </button>

                <h2 className="text-xl font-bold text-white mb-0.5">{user.name}</h2>
                <p className="text-sm text-neutral-400 mb-6">{user.email}</p>

                <div className="w-full space-y-3 mb-6">
                  <InfoRow label="ลงทะเบียน" value={fmt(user.createdAt)} />
                  <InfoRow label="แก้ไขล่าสุด" value={fmtDt(user.updatedAt)} />
                </div>

                <div className="w-full h-px bg-neutral-800 mb-6" />

                <div className="w-full flex flex-col gap-2.5">
                  <button
                    onClick={() => setEditOpen(true)}
                    className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all"
                    style={{ background: 'linear-gradient(135deg, #cc8f2a, #b57b14)', color: '#000' }}
                  >
                    แก้ไขโปรไฟล์
                  </button>
                  <button
                    onClick={() => setPwOpen(true)}
                    className="w-full py-2.5 rounded-lg text-sm font-medium border border-neutral-700 text-neutral-300 hover:border-neutral-600 hover:text-white transition-all"
                  >
                    เปลี่ยนรหัสผ่าน
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </SheetContent>
      </Sheet>

      {user && (
        <>
          <EditProfileDialog
            open={editOpen}
            onClose={() => setEditOpen(false)}
            user={user}
            token={session?.backendToken}
            onUpdated={(u) => setUser(u)}
          />
          <EditAvatarDialog
            open={avatarOpen}
            onClose={() => setAvatarOpen(false)}
            user={user}
            token={session?.backendToken}
            onUpdated={(u) => setUser(u)}
          />
          <ChangePasswordDialog
            open={pwOpen}
            onClose={() => setPwOpen(false)}
            token={session?.backendToken}
          />
        </>
      )}
    </>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-neutral-500 uppercase tracking-wider shrink-0">{label}</span>
      <span className="text-sm text-neutral-300 text-right">{value}</span>
    </div>
  );
}

function CameraIcon() {
  return (
    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
    </svg>
  );
}

const fmt = (d) => d ? new Date(d).toLocaleDateString("th-TH") : "-";
const fmtDt = (d) => d ? new Date(d).toLocaleString("th-TH") : "-";
