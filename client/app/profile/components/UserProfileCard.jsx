'use client';

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  Box,
  Typography,
  Card,
  Button,
  Avatar,
  Divider,
  Skeleton,
} from "@mui/material";
import { styled } from "@mui/system";
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

        // console.log("Session Token:", session.backendToken);
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
    <StyledCard>
      {isLoading ? (
        <>
          <Skeleton variant="circular" width={96} height={96} />
          <Skeleton variant="text" width="60%" sx={{ mt: 2 }} />
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="rectangular" width="100%" height={80} sx={{ mt: 2 }} />
        </>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <>
          <Avatar
            src={user?.avatarUrl || undefined}
            sx={{
              width: 96,
              height: 96,
              mb: 2,
              bgcolor: (theme) => theme.palette.primary.main,
              fontSize: 48,
              cursor: "pointer",
            }}
            alt={user?.name || "ผู้ใช้ไม่ระบุ"}
            onClick={() => setIsEditAvatarDialogOpen(true)}
          />
          <Typography variant="h5" sx={{ mt: 2, fontWeight: 700 }}>
            {user?.name || "ผู้ใช้ไม่ระบุ"}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {user?.email || "อีเมลไม่ระบุ"}
          </Typography>

          <Divider sx={{ my: 3, width: "100%" }} />

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, width: "100%" }}>
            <InfoItem label="👥 บทบาท" value={user?.role || "ไม่ระบุ"} />
            <InfoItem label="📅 วันที่ลงทะเบียน" value={formatDate(user?.createdAt)} />
            <InfoItem label="🛠️ วันที่แก้ไขล่าสุด" value={formatDateTime(user?.updatedAt)} />
          </Box>

          <Box
            sx={{
              mt: 3,
              width: "100%",
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "center",
              gap: 1,
            }}
          >
            <Button
              variant="contained"
              color="primary"
              sx={{ width: { xs: "100%", sm: "auto" } }}
              onClick={() => setIsEditDialogOpen(true)}
            >
              แก้ไขโปรไฟล์
            </Button>
            <Button
              variant="outlined"
              color="info"
              sx={{ width: { xs: "100%", sm: "auto" } }}
              onClick={() => setIsChangePasswordDialogOpen(true)}
            >
              เปลี่ยนรหัสผ่าน
            </Button>
          </Box>

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
    </StyledCard>
  );
}

function InfoItem({ label, value }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: 0.5,
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
        {label}:
      </Typography>
      <Box
        sx={(theme) => ({
          px: 2,
          py: 0.5,
          fontSize: '0.85rem',
          fontFamily: 'monospace',
          backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[800],
          borderRadius: '9999px',
          minWidth: { xs: 'auto', sm: 100 },
          maxWidth: '100%',
          textAlign: 'center',
          overflowWrap: 'anywhere',
        })}
      >
        {value}
      </Box>
    </Box>
  );
}

function formatDate(date) {
  return date ? new Date(date).toLocaleDateString("th-TH") : "-";
}

function formatDateTime(date) {
  return date ? new Date(date).toLocaleString("th-TH") : "-";
}

const StyledCard = styled(Card)(({ theme }) => ({
  width: "100%",
  maxWidth: 512,
  padding: theme.spacing(2.5),
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(4),
  },
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[5],
  backgroundColor: theme.palette.background.paper,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
}));
