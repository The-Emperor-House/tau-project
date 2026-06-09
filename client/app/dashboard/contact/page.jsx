"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Box,
  Typography,
  Card,
  TextField,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
  useTheme,
  Slide,
  Stack,
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { DataGrid } from "@mui/x-data-grid";
import * as XLSX from "xlsx";

// ---- Transition สำหรับ Dialog (รองรับ forwardRef) ----
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide ref={ref} direction="up" {...props} />;
});

// ---- format ข้อมูลจาก API ให้ปลอดภัย ----
const formatContacts = (data) =>
  (Array.isArray(data) ? data : []).map((c) => ({
    id: c.id,
    fullName: c.fullName ?? "-",
    email: c.email ?? "-",
    phone: c.phone ?? "-",
    budget: c.budget ?? null,
    areaSize: c.areaSize ?? null,
    needs: Array.isArray(c.needs) ? c.needs.join(", ") : c.needs ?? "-",
    details: c.details || "-",
    createdAt: c.createdAt ?? null,
  }));

export default function ContactListWithDetailModal() {
  const { data: session, status } = useSession();

  const [contacts, setContacts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // ---- ดึงข้อมูล ----
  useEffect(() => {
    if (status !== "authenticated") return;
    const ctrl = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/contacts`,
          {
            headers: { Authorization: `Bearer ${session?.backendToken}` },
            signal: ctrl.signal,
          }
        );
        if (!res.ok) throw new Error("โหลดข้อมูลไม่สำเร็จ");
        const data = await res.json();
        const formatted = formatContacts(data);
        setContacts(formatted);
        setFiltered(formatted);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "เกิดข้อผิดพลาด");
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => ctrl.abort();
  }, [session, status]);

  // ---- ค้นหาแบบดีบ๊าวซ์ ----
  const debounceRef = useRef(null);
  useEffect(() => {
    if (!contacts.length) {
      setFiltered([]);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const term = search.trim().toLowerCase();
      if (!term) {
        setFiltered(contacts);
        return;
      }
      setFiltered(
        contacts.filter((c) => {
          const hay =
            `${c.fullName} ${c.email} ${c.phone} ${c.needs}`.toLowerCase();
          return hay.includes(term);
        })
      );
    }, 250);
    return () => clearTimeout(debounceRef.current);
  }, [search, contacts]);

  // ---- Export Excel (ใช้หัวคอลัมน์ภาษาไทย) ----
  const exportToExcel = () => {
    const rows = filtered.map((c) => ({
      ชื่อ: c.fullName,
      อีเมล: c.email,
      เบอร์โทร: c.phone,
      บริการ: c.needs,
      งบประมาณ: c.budget ? Number(c.budget) : "",
      ขนาดพื้นที่: c.areaSize ? Number(c.areaSize) : "",
      รายละเอียดเพิ่มเติม: c.details,
      วันที่ส่ง: c.createdAt
        ? new Date(c.createdAt).toLocaleString("th-TH", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "",
    }));
    const sheet = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, "Contacts");
    XLSX.writeFile(wb, "contacts.xlsx");
  };

  // ---- คอลัมน์ของ DataGrid (responsive) ----
  const columns = useMemo(
    () =>
      [
        { field: "fullName", headerName: "ชื่อ", flex: 1, minWidth: 140 },
        !isMobile && {
          field: "email",
          headerName: "อีเมล",
          flex: 1,
          minWidth: 180,
        },
        { field: "phone", headerName: "เบอร์", flex: 1, minWidth: 120 },
        { field: "needs", headerName: "บริการ", flex: 1, minWidth: 180 },
      ].filter(Boolean),
    [isMobile]
  );

  // ---- ไม่ได้ล็อกอิน ----
  if (status === "unauthenticated") {
    return (
      <Box
        sx={{
          bgcolor: "#000",
          color: "#fff",
          minHeight: "100svh",
          width: "100%",
          pt: { xs: "140px", md: "170px" },
        }}
      >
        <Box sx={{ maxWidth: 1200, mx: "auto", px: 2 }}>
          <Alert severity="warning" sx={{ bgcolor: "#1e1e1e", color: "#fff" }}>
            กรุณาเข้าสู่ระบบเพื่อดูรายการติดต่อ
          </Alert>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        bgcolor: "#000",
        color: "#fff",
        minHeight: "100svh",
        width: "100%",
        pt: { xs: "140px", md: "270px" },
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: "auto", px: 2, pb: 6 }}>
        <Card
          sx={{
            p: { xs: 2, sm: 3 },
            bgcolor: "#0f0f0f",
            color: "#fff",
            borderRadius: 2,
            border: "1px solid #1f1f1f",
          }}
        >
          <Typography variant="h5" fontWeight={700} gutterBottom>
            📋 รายการ Contact ทั้งหมด
          </Typography>

          {/* Search + Export */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            gap={2}
            alignItems="stretch"
            sx={{ mb: 2 }}
          >
            <TextField
              label="ค้นหา"
              placeholder="ชื่อ / อีเมล / เบอร์ / บริการ"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{
                flex: 1,
                minWidth: 200,
                border: "1px solid #1f1f1f",
                "& .MuiOutlinedInput-root": { bgcolor: "#111", color: "#fff" },
                "& .MuiInputLabel-root": { color: "#bbb" },
              }}
            />
            <Button
              variant="contained"
              startIcon={<FileDownloadIcon />}
              onClick={exportToExcel}
              disabled={filtered.length === 0 || loading}
              sx={{
                bgcolor: "#cc8f2a",
                color: "#000",
                fontWeight: 700,
                "&:hover": { bgcolor: "#b57b14" },
              }}
              fullWidth={{ xs: true, sm: false }}
            >
              Export Excel
            </Button>
          </Stack>

          {/* Error */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* DataGrid */}
          <Box
            sx={{
              height: 600,
              width: "100%",
              "& .MuiDataGrid-root": { bgcolor: "#0f0f0f", color: "#fff" },
            }}
          >
            <DataGrid
              rows={filtered}
              columns={columns}
              loading={loading}
              pageSizeOptions={[10, 25, 50]}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
              }}
              disableRowSelectionOnClick
              onRowClick={(params) => setSelected(params.row)}
              sx={{
                // พื้นหลังรวม
                bgcolor: "#0f0f0f",
                color: "#fff",
                borderColor: "#1f1f1f",

                /* สำคัญ: คุมพื้นหลังส่วนบนของ DataGrid (v6 ใช้ตัวนี้) */
                "--DataGrid-containerBackground": "#0f0f0f",

                /* ส่วนหัวคอลัมน์ */
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "#111",
                  borderBottom: "1px solid #1f1f1f",
                },
                "& .MuiDataGrid-columnHeader, & .MuiDataGrid-columnHeaderTitle":
                  {
                    color: "#000000ff",
                    fontWeight: 600,
                  },
                "& .MuiDataGrid-sortIcon": { color: "#bbb" },

                /* เส้นแบ่งคอลัมน์ในหัวตาราง */
                "& .MuiDataGrid-columnSeparator": {
                  color: "#000000ff",
                  opacity: 1,
                },

                /* แถวข้อมูล */
                "& .MuiDataGrid-row:hover": { backgroundColor: "#151515" },
                "& .MuiDataGrid-cell": {
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  borderColor: "#1f1f1f",
                },

                /* ตัวหนังสือใน pagination */
                "& .MuiTablePagination-root, & .MuiTablePagination-root *": {
                  color: "#ddd",
                },
              }}
            />
          </Box>

          {/* Detail Modal */}
          <Dialog
            open={!!selected}
            onClose={() => setSelected(null)}
            fullWidth
            maxWidth="sm"
            fullScreen={isMobile}
            TransitionComponent={Transition}
          >
            <DialogTitle>รายละเอียด Contact</DialogTitle>
            <DialogContent dividers>
              {selected && (
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 1.2 }}
                >
                  <Typography>
                    <strong>ชื่อ:</strong> {selected.fullName}
                  </Typography>
                  <Typography>
                    <strong>อีเมล:</strong> {selected.email}
                  </Typography>
                  <Typography>
                    <strong>เบอร์โทร:</strong> {selected.phone}
                  </Typography>
                  <Typography>
                    <strong>บริการ:</strong> {selected.needs}
                  </Typography>
                  <Typography>
                    <strong>งบประมาณ:</strong>{" "}
                    {selected.budget != null && selected.budget !== ""
                      ? `${Number(selected.budget).toLocaleString("th-TH")} บาท`
                      : "-"}
                  </Typography>
                  <Typography>
                    <strong>ขนาดพื้นที่:</strong>{" "}
                    {selected.areaSize != null && selected.areaSize !== ""
                      ? `${Number(selected.areaSize).toLocaleString(
                          "th-TH"
                        )} ตร.ม.`
                      : "-"}
                  </Typography>
                  <Typography sx={{ whiteSpace: "pre-wrap" }}>
                    <strong>รายละเอียดเพิ่มเติม:</strong> {selected.details}
                  </Typography>
                  <Typography>
                    <strong>วันที่ส่ง:</strong>{" "}
                    {selected.createdAt
                      ? new Date(selected.createdAt).toLocaleString("th-TH", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-"}
                  </Typography>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              {/* ปุ่มลัด โทร/อีเมล เมื่อมีข้อมูล */}
              {selected?.phone && !isMobile && (
                <Button
                  component="a"
                  href={`tel:${selected.phone}`}
                  sx={{ mr: "auto" }}
                >
                  โทรหา
                </Button>
              )}
              {selected?.email && !isMobile && (
                <Button component="a" href={`mailto:${selected.email}`}>
                  ส่งอีเมล
                </Button>
              )}
              <Button onClick={() => setSelected(null)} fullWidth={isMobile}>
                ปิด
              </Button>
            </DialogActions>
          </Dialog>
        </Card>
      </Box>
    </Box>
  );
}
