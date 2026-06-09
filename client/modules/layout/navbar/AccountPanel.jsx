"use client";

import Link from "next/link";
import {
  Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  ListSubheader, Divider
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import DesignServicesIcon from "@mui/icons-material/DesignServices";
import WorkspacesIcon from "@mui/icons-material/Workspaces";
import PersonIcon from "@mui/icons-material/Person";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import NewspaperIcon from "@mui/icons-material/Newspaper";
import ChairIcon from "@mui/icons-material/Chair";
import LogoutIcon from "@mui/icons-material/Logout";

import useModalContext from "@/shared/hooks/useModalContext";

export default function AccountPanel({ onClose, onLogout }) {
  const { confirm, showLoading, hideLoading } = useModalContext();

  const handleLogoutClick = async () => {
    const ok = await confirm({
      title: "Sign out?",
      message: "Do you want to sign out now?",
      confirmText: "Sign out",
      cancelText: "Cancel",
      destructive: true, // ✅ ใช้ปุ่มสี error ใน ConfirmDialog
    });
    if (!ok) return;

    onClose?.();
    showLoading("Signing out...");
    try {
      await onLogout?.();
    } finally {
      hideLoading();
    }
  };

  return (
    <Box sx={{ pt: 0 }}>
      <List
        subheader={
          <ListSubheader
            sx={{ bgcolor: "transparent", color: "primary.main", fontWeight: 700, letterSpacing: ".06em" }}
          >
            Dashboard
          </ListSubheader>
        }
      >
        {[
          { href: "/dashboard/design", label: "Design", icon: <DesignServicesIcon /> },
          { href: "/dashboard/project", label: "Project", icon: <WorkspacesIcon /> },
          { href: "/dashboard/furniture", label: "Showroom", icon: <ChairIcon /> },
          { href: "/dashboard/news", label: "News", icon: <NewspaperIcon /> },
          { href: "/dashboard/contact", label: "Contact", icon: <ContactMailIcon /> },
        ].map((item) => (
          <ListItem key={item.href} disablePadding>
            <ListItemButton component={Link} href={item.href} onClick={onClose}>
              <ListItemIcon sx={{ color: "primary.main" }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}

        <Divider sx={(t) => ({ my: 1, borderColor: alpha(t.palette.divider, 0.6) })} />

        <ListItem disablePadding>
          <ListItemButton component={Link} href="/profile" onClick={onClose}>
            <ListItemIcon sx={{ color: "primary.main" }}>
              <PersonIcon />
            </ListItemIcon>
            <ListItemText primary="Profile" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton onClick={handleLogoutClick}>
            <ListItemIcon sx={{ color: "primary.main" }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );
}
