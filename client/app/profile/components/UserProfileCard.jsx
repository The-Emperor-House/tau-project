'use client';

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/components/ui/avatar";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Separator } from "@/shared/components/ui/separator";
import { Button } from "@/shared/components/ui/button";
import EditProfileDialog from "./EditProfileDialog";
import EditAvatarDialog from "./EditAvatarDialog";
import ChangePasswordDialog from "./ChangePasswordDialog";

export default function UserProfileCard() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isEditAvatarDialogOpen, setIsEditAvatarDialogOpen] = useState(false);
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (status !== "authenticated") return;

    const fetchUserData = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${session.backendToken}` },
        });
        if (res.status === 401) {
          console.warn("⚠️ Token expired or unauthorized, signing out...");
          signOut();
          return;
        }
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        const data = await res.json();
        if (isMounted) {
          if (!data?.data?.user) throw new Error("No user data received");
          setUser(data.data.user);
        }
      } catch (err) {
        console.error("🔥 Fetch user error:", err);
        if (isMounted) setError("ไม่สามารถโหลดข้อมูลผู้ใช้ได้");
      }
    };

    fetchUserData();
    return () => { isMounted = false; };
  }, [session, status]);

  const isLoading = status === "loading" || (status === "authenticated" && !user);

  return (
    <div className="w-full max-w-[512px] p-6 sm:p-8 rounded-2xl shadow-md bg-card flex flex-col items-center">
      {isLoading ? (
        <>
          <Skeleton className="w-24 h-24 rounded-full" />
          <Skeleton className="w-3/5 h-5 mt-4" />
          <Skeleton className="w-4/5 h-4 mt-2" />
          <Skeleton className="w-full h-20 mt-4" />
        </>
      ) : error ? (
        <p className="text-destructive">{error}</p>
      ) : (
        <>
          <Avatar
            className="w-24 h-24 mb-2 cursor-pointer text-5xl"
            onClick={() => setIsEditAvatarDialogOpen(true)}
          >
            <AvatarImage src={user?.avatarUrl || undefined} alt={user?.name || "ผู้ใช้ไม่ระบุ"} />
            <AvatarFallback className="bg-primary text-primary-foreground text-4xl">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>

          <h2 className="mt-2 text-xl font-bold">{user?.name || "ผู้ใช้ไม่ระบุ"}</h2>
          <p className="text-muted-foreground">{user?.email || "อีเมลไม่ระบุ"}</p>

          <Separator className="my-6 w-full" />

          <div className="flex flex-col gap-3 w-full">
            <InfoItem label="👥 บทบาท" value={user?.role || "ไม่ระบุ"} />
            <InfoItem label="📅 วันที่ลงทะเบียน" value={formatDate(user?.createdAt)} />
            <InfoItem label="🛠️ วันที่แก้ไขล่าสุด" value={formatDateTime(user?.updatedAt)} />
          </div>

          <div className="mt-6 w-full flex flex-col sm:flex-row justify-center gap-2">
            <Button className="w-full sm:w-auto" onClick={() => setIsEditDialogOpen(true)}>
              แก้ไขโปรไฟล์
            </Button>
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => setIsChangePasswordDialogOpen(true)}>
              เปลี่ยนรหัสผ่าน
            </Button>
          </div>

          <EditProfileDialog
            open={isEditDialogOpen}
            onClose={() => setIsEditDialogOpen(false)}
            user={user}
            token={session.backendToken}
            onUpdated={(updatedUser) => setUser(updatedUser)}
          />
          <EditAvatarDialog
            open={isEditAvatarDialogOpen}
            onClose={() => setIsEditAvatarDialogOpen(false)}
            user={user}
            token={session.backendToken}
            onUpdated={(updatedUser) => setUser(updatedUser)}
          />
          <ChangePasswordDialog
            open={isChangePasswordDialogOpen}
            onClose={() => setIsChangePasswordDialogOpen(false)}
            token={session.backendToken}
            onUpdated={(updatedUser) => setUser(updatedUser)}
          />
        </>
      )}
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
      <span className="text-sm font-medium text-muted-foreground">{label}:</span>
      <span className="px-3 py-0.5 text-sm font-mono bg-muted rounded-full text-center break-all">
        {value}
      </span>
    </div>
  );
}

function formatDate(date) {
  return date ? new Date(date).toLocaleDateString("th-TH") : "-";
}

function formatDateTime(date) {
  return date ? new Date(date).toLocaleString("th-TH") : "-";
}
