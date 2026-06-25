"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, useMediaQuery, useTheme } from "@mui/material";

const ROLES = ["ADMIN", "EDITOR", "VIEWER"];

const ROLE_STYLE = {
  ADMIN: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  EDITOR: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  VIEWER: "bg-neutral-500/15 text-neutral-400 border-neutral-500/30",
};

export default function UsersPage() {
  const { data: session } = useSession();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", role: "" });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${session?.backendToken}` },
      });
      if (!res.ok) throw new Error("โหลดข้อมูลไม่สำเร็จ");
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.backendToken) fetchUsers();
  }, [session?.backendToken]); // eslint-disable-line

  const openEdit = (user) => {
    setSelected(user);
    setEditForm({ name: user.name, role: user.role });
  };

  const handleSave = async () => {
    if (!editForm.name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${selected.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.backendToken}` },
        body: JSON.stringify({ name: editForm.name, role: editForm.role }),
      });
      if (!res.ok) throw new Error("บันทึกไม่สำเร็จ");
      setToast({ message: "อัปเดตผู้ใช้สำเร็จ", type: "success" });
      setSelected(null);
      fetchUsers();
    } catch (err) {
      setToast({ message: err.message, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const skeletons = Array.from({ length: 8 });

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white">Users</h1>
          {!loading && <p className="text-sm text-neutral-500 mt-0.5">{users.length} บัญชี</p>}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 px-4 py-3 text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg">{error}</div>
      )}

      {/* Table */}
      <div className="rounded-xl overflow-hidden border border-neutral-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-neutral-900 border-b border-neutral-800">
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500">ผู้ใช้</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500 hidden sm:table-cell">อีเมล</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Role</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500 hidden md:table-cell">วันที่ลงทะเบียน</th>
              <th className="px-4 py-3 w-20" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {loading
              ? skeletons.map((_, i) => (
                  <tr key={i} className="bg-neutral-950">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-neutral-800 animate-pulse shrink-0" />
                        <div className="h-3.5 w-28 bg-neutral-800 rounded animate-pulse" />
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell"><div className="h-3 w-36 bg-neutral-800 rounded animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="h-5 w-16 bg-neutral-800 rounded-full animate-pulse" /></td>
                    <td className="px-4 py-3 hidden md:table-cell"><div className="h-3 w-24 bg-neutral-800 rounded animate-pulse" /></td>
                    <td className="px-4 py-3" />
                  </tr>
                ))
              : users.map((user) => (
                  <tr key={user.id} className="bg-neutral-950 hover:bg-neutral-900 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {user.avatarUrl
                          ? <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full object-cover shrink-0" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                          : <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center text-xs font-semibold text-white shrink-0">{user.name?.charAt(0)?.toUpperCase()}</div>
                        }
                        <span className="text-white font-medium">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-neutral-400 hidden sm:table-cell">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${ROLE_STYLE[user.role] ?? ROLE_STYLE.VIEWER}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-500 text-xs hidden md:table-cell">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString("th-TH") : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openEdit(user)}
                        className="px-3 py-2 min-h-[40px] text-xs text-[#cc8f2a] border border-[#cc8f2a]/30 rounded-lg hover:bg-[#cc8f2a]/10 transition-colors"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!selected} onClose={() => setSelected(null)} fullWidth maxWidth="xs" fullScreen={fullScreen}>
        <DialogTitle sx={{ bgcolor: "#111", color: "#fff", borderBottom: "1px solid #262626" }}>
          แก้ไขผู้ใช้
        </DialogTitle>
        <DialogContent sx={{ bgcolor: "#111", color: "#e5e5e5", pt: "20px !important", display: "grid", gap: 2 }}>
          <TextField
            label="ชื่อ"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            fullWidth
            InputLabelProps={{ style: { color: "#737373" } }}
            inputProps={{ style: { color: "#fff" } }}
            sx={{ "& .MuiOutlinedInput-root": { "& fieldset": { borderColor: "#404040" }, "&.Mui-focused fieldset": { borderColor: "#cc8f2a" } } }}
          />
          <TextField
            select
            label="Role"
            value={editForm.role}
            onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
            fullWidth
            InputLabelProps={{ style: { color: "#737373" } }}
            inputProps={{ style: { color: "#fff" } }}
            sx={{ "& .MuiOutlinedInput-root": { "& fieldset": { borderColor: "#404040" }, "&.Mui-focused fieldset": { borderColor: "#cc8f2a" } } }}
          >
            {ROLES.map((r) => (
              <MenuItem key={r} value={r} sx={{ bgcolor: "#1a1a1a", color: "#fff", "&:hover": { bgcolor: "#262626" } }}>{r}</MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ bgcolor: "#111", borderTop: "1px solid #262626", px: 3, py: 2 }}>
          <button onClick={() => setSelected(null)} className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors">ยกเลิก</button>
          <button
            onClick={handleSave}
            disabled={saving || !editForm.name.trim()}
            className="px-4 py-2 text-sm font-medium bg-[#cc8f2a] text-black rounded-lg hover:bg-[#b57b14] disabled:opacity-50 transition-colors"
          >
            {saving ? "กำลังบันทึก..." : "บันทึก"}
          </button>
        </DialogActions>
      </Dialog>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-3 rounded-lg text-sm font-medium shadow-xl z-50 ${toast.type === "success" ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
