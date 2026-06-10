"use client";
import { useState, useEffect } from "react";
import { Search, Shield, User, GraduationCap, Trash2, ChevronDown, Pencil, X, Eye, EyeOff, Copy, Check } from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

interface UserItem {
  _id: string;
  name: string;
  email: string;
  role: "student" | "teacher" | "admin";
  gradeLevel?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

const ROLES = [
  { value: "student", label: "นักเรียน", color: "bg-blue-50 text-blue-700 border-blue-200",      badge: "bg-blue-100 text-blue-700",      icon: User },
  { value: "teacher", label: "ครู",      color: "bg-green-50 text-green-700 border-green-200",   badge: "bg-green-100 text-green-700",    icon: GraduationCap },
  { value: "admin",   label: "Admin",    color: "bg-purple-50 text-purple-700 border-purple-200", badge: "bg-purple-100 text-purple-700",  icon: Shield },
] as const;

const GRADE_LEVELS = [
  "ป.1","ป.2","ป.3","ป.4","ป.5","ป.6",
  "ม.1","ม.2","ม.3","ม.4","ม.5","ม.6",
  "ปวช.","ปวส.","มหาวิทยาลัย","ทั่วไป",
];

function roleInfo(role: string) {
  return ROLES.find((r) => r.value === role) ?? ROLES[0];
}

function generatePassword(len = 10) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#";
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export default function AdminUsersPage() {
  const [users, setUsers]           = useState<UserItem[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [filterRole, setFilterRole] = useState<"all" | "student" | "teacher" | "admin">("all");
  const [updating, setUpdating]     = useState<string | null>(null);

  // Edit modal
  const [editUser, setEditUser]     = useState<UserItem | null>(null);
  const [editForm, setEditForm]     = useState({ name: "", email: "", role: "student" as UserItem["role"], gradeLevel: "", password: "" });
  const [showPass, setShowPass]     = useState(false);
  const [saveError, setSaveError]   = useState("");
  const [copied, setCopied]         = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string; name: string }>({ open: false, id: "", name: "" });

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/users");
    if (res.ok) setUsers(await res.json());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openEdit = (u: UserItem) => {
    setEditUser(u);
    const gradeLevel = u.role !== "student" ? "ทุกระดับชั้น" : (u.gradeLevel ?? "");
    setEditForm({ name: u.name, email: u.email, role: u.role, gradeLevel, password: "" });
    setShowPass(false);
    setSaveError("");
    setCopied(false);
  };

  const handleSave = async () => {
    if (!editUser) return;
    setSaveError("");
    setUpdating(editUser._id);
    const body: Record<string, string> = {
      name: editForm.name,
      email: editForm.email,
      role: editForm.role,
      gradeLevel: editForm.gradeLevel,
    };
    if (editForm.password) body.password = editForm.password;

    const res = await fetch(`/api/admin/users/${editUser._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) { setSaveError(data.error ?? "เกิดข้อผิดพลาด"); }
    else {
      setUsers((prev) => prev.map((u) => u._id === editUser._id ? { ...u, ...data } : u));
      setEditUser(null);
    }
    setUpdating(null);
  };

  const changeRole = async (id: string, role: UserItem["role"]) => {
    setUpdating(id);
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (res.ok) setUsers((prev) => prev.map((u) => u._id === id ? { ...u, role } : u));
    setUpdating(null);
  };

  const deleteUser = async (id: string) => {
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    if (res.ok) setUsers((prev) => prev.filter((u) => u._id !== id));
  };

  const copyPass = () => {
    navigator.clipboard.writeText(editForm.password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filtered = users.filter((u) => {
    const matchRole   = filterRole === "all" || u.role === filterRole;
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const counts = { student: 0, teacher: 0, admin: 0 };
  users.forEach((u) => { if (u.role in counts) counts[u.role as keyof typeof counts]++; });

  const inputCls = "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white";

  return (
    <div>
      <ConfirmDialog
        open={deleteConfirm.open}
        title={`ลบบัญชี?`}
        message={`"${deleteConfirm.name}" จะถูกลบถาวร ไม่สามารถกู้คืนได้`}
        confirmLabel="ลบ"
        type="danger"
        onConfirm={() => deleteUser(deleteConfirm.id)}
        onCancel={() => setDeleteConfirm((d) => ({ ...d, open: false }))}
      />
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">จัดการผู้ใช้</h1>
        <p className="text-gray-500 text-sm mt-1">แก้ไขข้อมูล เปลี่ยน Role และรหัสผ่านของผู้ใช้</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-50 rounded-2xl p-5">
          <div className="text-3xl font-bold text-gray-900">{users.length}</div>
          <div className="text-sm text-gray-500 mt-1">ทั้งหมด</div>
        </div>
        {ROLES.map((r) => {
          const Icon = r.icon;
          return (
            <div key={r.value} className={`rounded-2xl p-5 ${r.badge}`}>
              <div className="flex items-center justify-between mb-1">
                <div className="text-3xl font-bold">{counts[r.value]}</div>
                <Icon className="w-6 h-6 opacity-60" />
              </div>
              <div className="text-sm opacity-75">{r.label}</div>
            </div>
          );
        })}
      </div>

      {/* Filter */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหาชื่อหรืออีเมล..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
        </div>
        <div className="flex gap-2">
          {([{ value: "all", label: "ทั้งหมด" }, ...ROLES.map((r) => ({ value: r.value, label: r.label }))] as const).map((f) => (
            <button key={f.value} onClick={() => setFilterRole(f.value as typeof filterRole)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${filterRole === f.value ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-gray-400">กำลังโหลด...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">ไม่พบผู้ใช้</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">ผู้ใช้</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">ระดับชั้น</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">วันที่สมัคร</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">เปลี่ยน Role</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((u) => {
                const info = roleInfo(u.role);
                const Icon = info.icon;
                return (
                  <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${info.badge}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{u.name}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">
                      {u.role !== "student"
                        ? <span className="text-indigo-600 font-medium">ทุกระดับชั้น</span>
                        : (u.gradeLevel || "—")}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${info.badge}`}>
                        <Icon className="w-3 h-3" />{info.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="relative inline-block">
                        <select value={u.role} onChange={(e) => changeRole(u._id, e.target.value as UserItem["role"])}
                          disabled={updating === u._id}
                          className={`appearance-none pl-3 pr-8 py-1.5 rounded-lg text-sm font-medium border transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 ${info.color}`}>
                          {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none text-gray-500" />
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(u)}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="แก้ไข">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteConfirm({ open: true, id: u._id, name: u.name })}
                          className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="ลบ">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      <p className="text-xs text-gray-400 mt-3 text-right">แสดง {filtered.length} จาก {users.length} คน</p>

      {/* Edit Modal */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">แก้ไขข้อมูลผู้ใช้</h2>
              <button onClick={() => setEditUser(null)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">ชื่อ-นามสกุล</label>
                <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className={inputCls} placeholder="ชื่อ-นามสกุล" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">อีเมล</label>
                <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className={inputCls} placeholder="อีเมล" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
                <select value={editForm.role}
                  onChange={(e) => {
                    const newRole = e.target.value as UserItem["role"];
                    const newGrade = newRole === "student" ? "" : "ทุกระดับชั้น";
                    setEditForm({ ...editForm, role: newRole, gradeLevel: newGrade });
                  }}
                  className={inputCls}>
                  {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>

              {/* Grade level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">ระดับชั้น</label>
                {editForm.role === "student" ? (
                  <select value={editForm.gradeLevel}
                    onChange={(e) => setEditForm({ ...editForm, gradeLevel: e.target.value })}
                    className={inputCls}>
                    <option value="">— ไม่ระบุ —</option>
                    {GRADE_LEVELS.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                ) : (
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 border border-indigo-200 rounded-xl">
                    <span className="text-sm font-semibold text-indigo-700">ทุกระดับชั้น</span>
                    <span className="text-xs text-indigo-400">(กำหนดอัตโนมัติตาม Role)</span>
                  </div>
                )}
              </div>

              {/* Password section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  รหัสผ่านใหม่ <span className="text-gray-400 font-normal">(เว้นว่างถ้าไม่เปลี่ยน)</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showPass ? "text" : "password"}
                      value={editForm.password}
                      onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                      placeholder="รหัสผ่านใหม่"
                      className={`${inputCls} pr-10`}
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Copy button */}
                  {editForm.password && (
                    <button type="button" onClick={copyPass}
                      className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-colors" title="copy รหัสผ่าน">
                      {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  )}
                  {/* Auto-generate */}
                  <button type="button"
                    onClick={() => { const p = generatePassword(); setEditForm({ ...editForm, password: p }); setShowPass(true); }}
                    className="px-3 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap">
                    สร้างอัตโนมัติ
                  </button>
                </div>
                {editForm.password && (
                  <p className="text-xs text-indigo-600 mt-1.5 font-mono bg-indigo-50 px-3 py-1.5 rounded-lg">
                    {editForm.password}
                  </p>
                )}
              </div>

              {saveError && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-xl">{saveError}</p>}
            </div>

            {/* Modal footer */}
            <div className="flex gap-3 px-6 py-5 border-t border-gray-100">
              <button onClick={handleSave} disabled={updating === editUser._id}
                className="flex-1 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors text-sm">
                {updating === editUser._id ? "กำลังบันทึก..." : "บันทึก"}
              </button>
              <button onClick={() => setEditUser(null)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors text-sm">
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
