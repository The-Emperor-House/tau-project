"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";

const ROLES = ["ADMIN", "EDITOR", "VIEWER"];

const ROLE_STYLE = {
  ADMIN: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  EDITOR: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  VIEWER: "bg-neutral-500/15 text-neutral-400 border-neutral-500/30",
};

export default function UsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", role: "" });
  const [saving, setSaving] = useState(false);

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
      toast.success("อัปเดตผู้ใช้สำเร็จ");
      setSelected(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const skeletons = Array.from({ length: 8 });

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white">Users</h1>
          {!loading && <p className="text-sm text-neutral-500 mt-0.5">{users.length} บัญชี</p>}
        </div>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg">{error}</div>
      )}

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

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-xs bg-[#111] border-[#262626] text-[#e5e5e5]">
          <DialogHeader>
            <DialogTitle className="text-white border-b border-[#262626] pb-2">แก้ไขผู้ใช้</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 pt-1">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="u-name" className="text-neutral-400">ชื่อ</Label>
              <Input
                id="u-name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="bg-[#0a0a0a] border-[#404040] text-white focus-visible:ring-[#cc8f2a]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-neutral-400">Role</Label>
              <Select value={editForm.role} onValueChange={(v) => setEditForm({ ...editForm, role: v })}>
                <SelectTrigger className="bg-[#0a0a0a] border-[#404040] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-[#404040] text-white">
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r} className="focus:bg-[#262626] focus:text-white">{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="border-t border-[#262626] pt-3 gap-2">
            <Button variant="ghost" className="text-neutral-400 hover:text-white" onClick={() => setSelected(null)}>ยกเลิก</Button>
            <Button
              onClick={handleSave}
              disabled={saving || !editForm.name.trim()}
              className="bg-[#cc8f2a] text-black hover:bg-[#b57b14] disabled:opacity-50"
            >
              {saving ? "กำลังบันทึก..." : "บันทึก"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
