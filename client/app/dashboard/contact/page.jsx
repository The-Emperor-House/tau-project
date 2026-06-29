"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { DataGrid } from "@mui/x-data-grid";
import * as XLSX from "xlsx";

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

export default function ContactPage() {
  const { data: session, status } = useSession();
  const [contacts, setContacts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (status !== "authenticated") return;
    const ctrl = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contacts`, {
          headers: { Authorization: `Bearer ${session?.backendToken}` },
          signal: ctrl.signal,
        });
        if (!res.ok) throw new Error("โหลดข้อมูลไม่สำเร็จ");
        const data = await res.json();
        const formatted = formatContacts(data);
        setContacts(formatted);
        setFiltered(formatted);
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, [session, status]);

  const debounceRef = useRef(null);
  useEffect(() => {
    if (!contacts.length) { setFiltered([]); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const term = search.trim().toLowerCase();
      setFiltered(
        !term ? contacts : contacts.filter((c) =>
          `${c.fullName} ${c.email} ${c.phone} ${c.needs}`.toLowerCase().includes(term)
        )
      );
    }, 250);
    return () => clearTimeout(debounceRef.current);
  }, [search, contacts]);

  const exportToExcel = () => {
    const rows = filtered.map((c) => ({
      ชื่อ: c.fullName, อีเมล: c.email, เบอร์โทร: c.phone,
      บริการ: c.needs,
      งบประมาณ: c.budget ? Number(c.budget) : "",
      ขนาดพื้นที่: c.areaSize ? Number(c.areaSize) : "",
      รายละเอียด: c.details,
      วันที่: c.createdAt ? new Date(c.createdAt).toLocaleString("th-TH") : "",
    }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), "Contacts");
    XLSX.writeFile(wb, "contacts.xlsx");
  };

  const columns = useMemo(() => [
    { field: "fullName", headerName: "ชื่อ", flex: 1, minWidth: 140 },
    { field: "email", headerName: "อีเมล", flex: 1, minWidth: 180 },
    { field: "phone", headerName: "เบอร์", flex: 1, minWidth: 120 },
    { field: "needs", headerName: "บริการ", flex: 1.5, minWidth: 200 },
    {
      field: "createdAt", headerName: "วันที่", flex: 1, minWidth: 140,
      valueFormatter: (v) => v ? new Date(v).toLocaleDateString("th-TH") : "-",
    },
  ], []);

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white">Contacts</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{filtered.length} รายการ</p>
        </div>
        <button
          onClick={exportToExcel}
          disabled={filtered.length === 0 || loading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#cc8f2a] text-black rounded-lg hover:bg-[#b57b14] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <DownloadIcon />
          Export Excel
        </button>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="ค้นหาชื่อ / อีเมล / เบอร์ / บริการ..."
        className="w-full sm:w-80 mb-4 px-4 py-2 text-sm bg-neutral-900 border border-neutral-700 text-white placeholder:text-neutral-500 rounded-lg outline-none focus:border-neutral-500 transition-colors"
      />

      {error && (
        <div className="mb-4 px-4 py-3 text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg">
          {error}
        </div>
      )}

      <div className="rounded-xl overflow-x-auto border border-neutral-800" style={{ WebkitOverflowScrolling: "touch" }}>
        <DataGrid
          rows={filtered}
          columns={columns}
          loading={loading}
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          disableRowSelectionOnClick
          onRowClick={(p) => setSelected(p.row)}
          autoHeight
          sx={{
            bgcolor: "#0a0a0a", color: "#e5e5e5", border: "none",
            "--DataGrid-containerBackground": "#111",
            "& .MuiDataGrid-columnHeaders": { bgcolor: "#111", borderBottom: "1px solid #262626" },
            "& .MuiDataGrid-columnHeaderTitle": { color: "#a3a3a3", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" },
            "& .MuiDataGrid-row:hover": { bgcolor: "#141414" },
            "& .MuiDataGrid-cell": { borderColor: "#1a1a1a", fontSize: "0.875rem" },
            "& .MuiDataGrid-sortIcon, & .MuiDataGrid-menuIconButton": { color: "#737373" },
            "& .MuiTablePagination-root, & .MuiTablePagination-root *": { color: "#737373" },
            "& .MuiDataGrid-footerContainer": { borderTop: "1px solid #1a1a1a", bgcolor: "#0a0a0a" },
          }}
        />
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="sm:max-w-sm bg-[#111] border-[#262626] text-[#e5e5e5]">
          <DialogHeader>
            <DialogTitle className="text-white border-b border-[#262626] pb-2">รายละเอียด Contact</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 pt-1">
              <DetailRow label="ชื่อ" value={selected.fullName} />
              <DetailRow label="อีเมล" value={selected.email} />
              <DetailRow label="เบอร์โทร" value={selected.phone} />
              <DetailRow label="บริการ" value={selected.needs} />
              <DetailRow label="งบประมาณ" value={selected.budget != null ? `${Number(selected.budget).toLocaleString("th-TH")} บาท` : "-"} />
              <DetailRow label="ขนาดพื้นที่" value={selected.areaSize != null ? `${Number(selected.areaSize).toLocaleString("th-TH")} ตร.ม.` : "-"} />
              <DetailRow label="รายละเอียด" value={selected.details} />
              <DetailRow label="วันที่ส่ง" value={selected.createdAt ? new Date(selected.createdAt).toLocaleString("th-TH") : "-"} />
            </div>
          )}
          <DialogFooter className="border-t border-[#262626] pt-3 gap-2 flex-row">
            {selected?.phone && (
              <a href={`tel:${selected.phone}`} className="text-[#cc8f2a] text-sm mr-auto hover:underline">โทรหา</a>
            )}
            {selected?.email && (
              <a href={`mailto:${selected.email}`} className="text-neutral-400 text-sm hover:underline">อีเมล</a>
            )}
            <Button variant="outline" size="sm" onClick={() => setSelected(null)}>ปิด</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex gap-3">
      <span className="text-sm text-neutral-500 w-28 shrink-0">{label}</span>
      <span className="text-sm text-white break-words flex-1">{value}</span>
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
    </svg>
  );
}
