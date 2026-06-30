"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Shield, ShieldCheck, User, GraduationCap, Trash2, ChevronDown, Pencil, X, Eye, EyeOff, Copy, Check, Camera, UserPlus, ExternalLink, Heart } from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import LoadingSpinner from "@/components/LoadingSpinner";

interface UserItem {
  _id: string;
  name: string;
  email: string;
  role: "student" | "teacher" | "parent" | "admin" | "owner" | "super_admin";
  gradeLevel?: string;
  profileImage?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  studentId?: string;
  studentName?: string;
}

const ROLES = [
  { value: "student",     label: "นักเรียน",    color: "bg-blue-50 text-blue-700 border-blue-200",       badge: "bg-blue-100 text-blue-700",      icon: User },
  { value: "parent",      label: "ผู้ปกครอง",    color: "bg-pink-50 text-pink-700 border-pink-200",       badge: "bg-pink-100 text-pink-700",      icon: Heart },
  { value: "teacher",     label: "ครู",          color: "bg-green-50 text-green-700 border-green-200",    badge: "bg-green-100 text-green-700",    icon: GraduationCap },
  { value: "admin",       label: "Admin",        color: "bg-purple-50 text-purple-700 border-purple-200", badge: "bg-purple-100 text-purple-700",  icon: Shield },
  { value: "owner",       label: "Owner",        color: "bg-violet-50 text-violet-700 border-violet-200", badge: "bg-violet-100 text-violet-700",  icon: ShieldCheck },
  { value: "super_admin", label: "Super Admin",  color: "bg-rose-50 text-rose-700 border-rose-200",       badge: "bg-rose-100 text-rose-700",      icon: ShieldCheck },
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

interface StudentOption {
  _id: string;
  name: string;
  gradeLevel?: string;
}

export default function AdminUsersPage() {
  const [users, setUsers]           = useState<UserItem[]>([]);
  const [students, setStudents]     = useState<StudentOption[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [filterRole, setFilterRole] = useState<"all" | "student" | "teacher" | "parent" | "admin" | "owner" | "super_admin">("all");
  const [updating, setUpdating]     = useState<string | null>(null);
  const [myRole, setMyRole]         = useState<string>("");

  // Edit modal
  const [editUser, setEditUser]     = useState<UserItem | null>(null);
  const [editForm, setEditForm]     = useState<{ name: string; email: string; role: UserItem["role"]; gradeLevel: string; password: string; profileImage: string; studentId: string; studentName: string }>({ name: "", email: "", role: "student", gradeLevel: "", password: "", profileImage: "", studentId: "", studentName: "" });
  const [showPass, setShowPass]     = useState(false);
  const [saveError, setSaveError]   = useState("");
  const [copied, setCopied]         = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const fileInputRef                = useRef<HTMLInputElement>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string; name: string }>({ open: false, id: "", name: "" });

  // Create user modal
  const [createOpen, setCreateOpen]     = useState(false);
  const [createForm, setCreateForm]     = useState({ name: "", email: "", role: "student" as UserItem["role"], gradeLevel: "", password: "", studentId: "", studentName: "" });
  const [createError, setCreateError]   = useState("");
  const [creating, setCreating]         = useState(false);
  const [createShowPass, setCreateShowPass] = useState(false);
  const [createCopied, setCreateCopied] = useState(false);

  const load = async () => {
    setLoading(true);
    const [usersRes, meRes, studentsRes] = await Promise.all([
      fetch("/api/admin/users"),
      fetch("/api/auth/me"),
      fetch("/api/admin/users?role=student&unassigned=true")
    ]);
    if (usersRes.ok) setUsers(await usersRes.json());
    if (meRes.ok) { const d = await meRes.json(); setMyRole(d.user?.role ?? ""); }
    if (studentsRes.ok) setStudents(await studentsRes.json());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (editUser || createOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [editUser, createOpen]);

  // super_admin-only role — hide from regular admin
  const visibleRoles = myRole === "super_admin" ? ROLES : ROLES.filter((r) => r.value !== "super_admin" && r.value !== "owner");

  const openEdit = (u: UserItem) => {
    setEditUser(u);
    const gradeLevel = (u.role === "student" || u.role === "parent") ? (u.gradeLevel ?? "") : "ทุกระดับชั้น";
    setEditForm({ name: u.name, email: u.email, role: u.role, gradeLevel, password: "", profileImage: u.profileImage ?? "", studentId: u.studentId ?? "", studentName: u.studentName ?? "" });
    setShowPass(false);
    setSaveError("");
    setCopied(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImg(true);
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json();
    if (res.ok && data.url) setEditForm((f) => ({ ...f, profileImage: data.url }));
    setUploadingImg(false);
  };

  const handleSave = async () => {
    if (!editUser) return;
    setSaveError("");
    if (!editForm.email.toLowerCase().endsWith("@gmail.com")) {
      setSaveError("อีเมลต้องเป็น @gmail.com เท่านั้น"); return;
    }
    setUpdating(editUser._id);
    const body: Record<string, string> = {
      name: editForm.name,
      email: editForm.email,
      role: editForm.role,
      gradeLevel: editForm.gradeLevel,
      profileImage: editForm.profileImage,
      studentId: editForm.role === "parent" ? editForm.studentId : "",
      studentName: editForm.role === "parent" ? editForm.studentName : "",
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

  const copyCreatePass = () => {
    navigator.clipboard.writeText(createForm.password);
    setCreateCopied(true);
    setTimeout(() => setCreateCopied(false), 2000);
  };

  const openCreate = () => {
    setCreateForm({ name: "", email: "", role: "student", gradeLevel: "", password: "", studentId: "", studentName: "" });
    setCreateError("");
    setCreateShowPass(false);
    setCreateCopied(false);
    setCreateOpen(true);
  };

  const handleCreate = async () => {
    setCreateError("");
    if (!createForm.name || !createForm.email || !createForm.password) {
      setCreateError("กรุณากรอกข้อมูลให้ครบ"); return;
    }
    if (!createForm.email.toLowerCase().endsWith("@gmail.com")) {
      setCreateError("อีเมลต้องเป็น @gmail.com เท่านั้น"); return;
    }
    if (createForm.password.length < 6) {
      setCreateError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"); return;
    }
    setCreating(true);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: createForm.name,
        email: createForm.email,
        password: createForm.password,
        role: createForm.role,
        gradeLevel: (createForm.role === "student" || createForm.role === "parent") ? createForm.gradeLevel : "ทุกระดับชั้น",
        studentId: createForm.role === "parent" ? createForm.studentId : "",
        studentName: createForm.role === "parent" ? createForm.studentName : "",
        status: "approved",
      }),
    });
    const data = await res.json();
    if (!res.ok) { setCreateError(data.error ?? "เกิดข้อผิดพลาด"); }
    else {
      setUsers((prev) => [data, ...prev]);
      setCreateOpen(false);
    }
    setCreating(false);
  };

  // Hide super_admin users from non-super_admin admins
  const visibleUsers = myRole === "super_admin" ? users : users.filter((u) => u.role !== "super_admin");

  const filtered = visibleUsers.filter((u) => {
    const matchRole   = filterRole === "all" || u.role === filterRole;
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const counts = { student: 0, teacher: 0, parent: 0, admin: 0, owner: 0, super_admin: 0 };
  visibleUsers.forEach((u) => { if (u.role in counts) counts[u.role as keyof typeof counts]++; });

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
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">จัดการผู้ใช้</h1>
          <p className="text-gray-500 text-sm mt-1">แก้ไขข้อมูล เปลี่ยน Role และรหัสผ่านของผู้ใช้</p>
        </div>
        {(myRole === "admin" || myRole === "super_admin" || myRole === "owner") && (
          <button onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors shrink-0">
            <UserPlus className="w-4 h-4" />
            เพิ่มผู้ใช้
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 mb-8" style={{ gridTemplateColumns: `repeat(${visibleRoles.length + 1}, 1fr)` }}>
        <div className="bg-white rounded-2xl border border-gray-100 border-l-4 border-l-violet-500 p-5">
          <div className="text-3xl font-bold text-gray-900">{visibleUsers.length}</div>
          <div className="text-sm text-gray-500 mt-1">ทั้งหมด</div>
        </div>
        {visibleRoles.map((r) => {
          const Icon = r.icon;
          const borderColors: Record<string, string> = {
            student: "border-l-blue-500",
            parent: "border-l-pink-500",
            teacher: "border-l-green-500",
            admin: "border-l-purple-500",
            owner: "border-l-violet-500",
            super_admin: "border-l-rose-500",
          };
          const textColors: Record<string, string> = {
            student: "text-blue-600",
            parent: "text-pink-600",
            teacher: "text-green-600",
            admin: "text-purple-600",
            owner: "text-violet-600",
            super_admin: "text-rose-600",
          };
          return (
            <div key={r.value} className={`bg-white rounded-2xl border border-gray-100 border-l-4 ${borderColors[r.value]} p-5`}>
              <div className="flex items-center justify-between mb-1">
                <div className="text-3xl font-bold text-gray-900">{counts[r.value]}</div>
                <Icon className={`w-6 h-6 ${textColors[r.value]}`} />
              </div>
              <div className="text-sm text-gray-600">{r.label}</div>
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
          {([{ value: "all", label: "ทั้งหมด" }, ...visibleRoles.map((r) => ({ value: r.value, label: r.label }))] as const).map((f) => (
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
          <LoadingSpinner />
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
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 overflow-hidden ${!u.profileImage ? info.badge : ""}`}>
                          {u.profileImage ? (
                            <Image src={u.profileImage} alt={u.name} width={36} height={36} className="w-full h-full object-cover" />
                          ) : (
                            <Icon className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{u.name}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">
                      {(u.role === "student" || u.role === "parent")
                        ? (u.gradeLevel || "—")
                        : <span className="text-indigo-600 font-medium">ทุกระดับชั้น</span>}
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
                      {u.role === "owner" ? (
                        <span className="text-xs text-gray-400 italic">—</span>
                      ) : (
                        <div className="relative inline-block">
                          <select value={u.role} onChange={(e) => changeRole(u._id, e.target.value as UserItem["role"])}
                            disabled={updating === u._id}
                            className={`appearance-none pl-3 pr-8 py-1.5 rounded-lg text-sm font-medium border transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 ${info.color}`}>
                            {visibleRoles.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none text-gray-500" />
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/admin/profile/${u._id}`}
                          className="p-1.5 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors" title="ดูโปรไฟล์">
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        {u.role !== "owner" && (
                          <button onClick={() => openEdit(u)}
                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="แก้ไข">
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}
                        {u.role !== "owner" && (
                          <button onClick={() => setDeleteConfirm({ open: true, id: u._id, name: u.name })}
                            className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="ลบ">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        {u.role === "owner" && (
                          <span className="text-xs text-gray-300 px-2">จัดการโดย Super Admin</span>
                        )}
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

      {/* Create User Modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
              <h2 className="text-lg font-bold text-gray-900">เพิ่มผู้ใช้ใหม่</h2>
              <button onClick={() => setCreateOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">ชื่อ-นามสกุล <span className="text-red-500">*</span></label>
                <input value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className={inputCls} placeholder="ชื่อ-นามสกุล" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">อีเมล <span className="text-red-500">*</span></label>
                <input type="email" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  className={inputCls} placeholder="อีเมล" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
                <select value={createForm.role}
                  onChange={(e) => {
                    const r = e.target.value as UserItem["role"];
                    setCreateForm({ ...createForm, role: r, gradeLevel: (r === "student" || r === "parent") ? "" : "ทุกระดับชั้น" });
                  }}
                  className={inputCls}>
                  {visibleRoles.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              {createForm.role === "student" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">ระดับชั้น</label>
                  <select value={createForm.gradeLevel} onChange={(e) => setCreateForm({ ...createForm, gradeLevel: e.target.value })} className={inputCls}>
                    <option value="">— ไม่ระบุ —</option>
                    {GRADE_LEVELS.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              )}
              {createForm.role !== "student" && createForm.role !== "parent" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">ระดับชั้น</label>
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 border border-indigo-200 rounded-xl">
                    <span className="text-sm font-semibold text-indigo-700">ทุกระดับชั้น</span>
                    <span className="text-xs text-indigo-400">(กำหนดอัตโนมัติตาม Role)</span>
                  </div>
                </div>
              )}
              {createForm.role === "parent" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">นักเรียน <span className="text-red-500">*</span></label>
                  {students.length === 0 ? (
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-700">
                      ⚠️ ยังไม่มีนักเรียนในระบบ กรุณาสร้างนักเรียนก่อน
                    </div>
                  ) : (
                    <select value={createForm.studentId} onChange={(e) => {
                      const selected = students.find((s) => s._id === e.target.value);
                      setCreateForm({ ...createForm, studentId: e.target.value, studentName: selected?.name ?? "" });
                    }} className={inputCls}>
                      <option value="">— เลือกนักเรียน —</option>
                      {students.map((s) => (
                        <option key={s._id} value={s._id}>{s.name} ({s.gradeLevel || "—"})</option>
                      ))}
                    </select>
                  )}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">รหัสผ่าน <span className="text-red-500">*</span></label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={createShowPass ? "text" : "password"}
                      value={createForm.password}
                      onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                      placeholder="รหัสผ่านอย่างน้อย 6 ตัวอักษร"
                      className={`${inputCls} pr-10`}
                    />
                    <button type="button" onClick={() => setCreateShowPass(!createShowPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {createShowPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {createForm.password && (
                    <button type="button" onClick={copyCreatePass}
                      className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-colors" title="copy รหัสผ่าน">
                      {createCopied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  )}
                  <button type="button"
                    onClick={() => { const p = generatePassword(); setCreateForm((f) => ({ ...f, password: p })); setCreateShowPass(true); }}
                    className="px-3 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap">
                    สร้างอัตโนมัติ
                  </button>
                </div>
                {createForm.password && (
                  <p className="text-xs text-indigo-600 mt-1.5 font-mono bg-indigo-50 px-3 py-1.5 rounded-lg">
                    {createForm.password}
                  </p>
                )}
              </div>

              {createError && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-xl">{createError}</p>}
            </div>

            <div className="flex gap-3 px-6 py-5 border-t border-gray-100 shrink-0">
              <button onClick={handleCreate} disabled={creating}
                className="flex-1 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors text-sm">
                {creating ? "กำลังสร้าง..." : "สร้างบัญชี"}
              </button>
              <button onClick={() => setCreateOpen(false)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors text-sm">
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
              <h2 className="text-lg font-bold text-gray-900">แก้ไขข้อมูลผู้ใช้</h2>
              <button onClick={() => setEditUser(null)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 space-y-4 overflow-y-auto">
              {/* Profile image upload */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <div className={`w-20 h-20 rounded-full overflow-hidden flex items-center justify-center ${!editForm.profileImage ? `${roleInfo(editForm.role).badge}` : "bg-gray-100"}`}>
                    {editForm.profileImage ? (
                      <Image src={editForm.profileImage} alt="profile" width={80} height={80} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-bold opacity-60">
                        {editForm.name ? editForm.name[0].toUpperCase() : "?"}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImg}
                    className="absolute bottom-0 right-0 w-7 h-7 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow transition-colors disabled:opacity-50"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                {uploadingImg && <p className="text-xs text-indigo-500">กำลังอัปโหลด...</p>}
                {editForm.profileImage && (
                  <button
                    type="button"
                    onClick={() => setEditForm((f) => ({ ...f, profileImage: "" }))}
                    className="text-xs text-red-500 hover:underline"
                  >
                    ลบรูปภาพ
                  </button>
                )}
              </div>

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
                    const newGrade = (newRole === "student" || newRole === "parent") ? "" : "ทุกระดับชั้น";
                    setEditForm({ ...editForm, role: newRole, gradeLevel: newGrade });
                  }}
                  className={inputCls}>
                  {visibleRoles.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>

              {/* Grade level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">ระดับชั้น</label>
                {(editForm.role === "student" || editForm.role === "parent") ? (
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

              {/* Student selection for parent */}
              {editForm.role === "parent" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">นักเรียน <span className="text-red-500">*</span></label>
                  <select value={editForm.studentId} onChange={(e) => {
                    const selected = students.find((s) => s._id === e.target.value);
                    setEditForm({ ...editForm, studentId: e.target.value, studentName: selected?.name ?? "" });
                  }} className={inputCls}>
                    <option value="">— เลือกนักเรียน —</option>
                    {students.map((s) => (
                      <option key={s._id} value={s._id}>{s.name} ({s.gradeLevel || "—"})</option>
                    ))}
                  </select>
                </div>
              )}

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
            <div className="flex gap-3 px-6 py-5 border-t border-gray-100 shrink-0">
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
