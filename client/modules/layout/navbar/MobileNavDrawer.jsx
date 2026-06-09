"use client";

import Link from "next/link";
import {
  Drawer,
  Box,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import { usePathname } from "next/navigation";

export default function MobileNavDrawer({
  open,
  onClose,
  links,
  extra,
}) {
  const pathname = usePathname() || "/";
  const isActive = (href) => pathname === href || pathname.startsWith(href + "/");

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: (t) => ({
          bgcolor: "grey.900",
          color: "common.white",
          width: 280,
          borderLeft: `1px solid ${alpha(t.palette.common.white, 0.12)}`,
        }),
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "flex-end", p: 2 }}>
        <IconButton onClick={onClose} sx={{ color: "common.white" }} aria-label="close menu">
          <CloseIcon />
        </IconButton>
      </Box>

      <List sx={{ pt: 0 }}>
        {links.map((link) => (
          <ListItem key={link.href} disablePadding>
            <ListItemButton
              component={Link}
              href={link.href}
              onClick={onClose}
              selected={isActive(link.href)}
              sx={{
                "&.Mui-selected": {
                  bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                  color: "primary.main",
                },
              }}
            >
              <ListItemText primary={link.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {extra ? (
        <>
          <Divider sx={(t) => ({ my: 1, borderColor: alpha(t.palette.common.white, 0.12) })} />
          {extra}
        </>
      ) : null}
    </Drawer>
  );
}
