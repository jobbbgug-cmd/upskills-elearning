"use client";
import { useState, useEffect, useMemo } from "react";
import {
  User, GraduationCap, Shield, ShieldCheck,
  ChevronDown, Search, Plus, X, Eye, EyeOff,
  Copy, Check, Pencil, Trash2, ChevronUp, ChevronsUpDown, Building2,
} from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

type Role = "student" | "teacher" | "admin" | "super_admin";
type SortKey = "name" | "email" | "role" | "status" | "createdAt";
type SortDir = "asc" | "desc";

interface UserItem {
  _id: string;
  name: string;
  email: string;
  role: Role;
  status: "pending" | "approved" | "rejected";
  gradeLevel?: string;
  createdAt: string;
  institutionId?: string;
}

interface Institution {
  _id: string;
  name: string;
}

const ROLE_DEF = {
  student:     { label: "นักเรียน",    badge: "bg-blue-100 text-blue-700",    border: "border-blue-300",   icon: User,         desc: "ดูคอร์ส · จองที่นั่ง · อัปโหลดสลิป",      path: "/dashboard" },
  teacher:     { label: "ครู",          badge: "bg-green-100 text-green-700",  border: "border-green-300",  icon: GraduationCap,desc: "ดูคอร์ส · ตารางสอน (Admin panel)",         path: "/admin" },
  admin:       { label: "Admin",        badge: "bg-purple-100 text-purple-700",border: "border-purple-300", icon: Shield,       desc: "จัดการคอร์ส · อนุมัติ · รายได้ · Branding",path: "/admin/*" },
  super_admin: { label: "Super Admin",  badge: "bg-rose-100 text-rose-700",    border: "border-rose-300",   icon: ShieldCheck,  desc: "จัดการทุกสถาบัน · Commission · Payout",    path: "/super-admin/*" },
} as const;

const STATUS_DEF = {
  approved: { label: "อนุมัติแล้ว", cls: "bg-green-100 text-green-700" },
  pending:  { label: "รออนุมัติ",   cls: "bg-yellow-100 text-yellow-700" },
  rejected: { label: "ปฏิเสธ",      cls: "bg-red-100 text-red-700" },
};

const GRADE_LEVELS = ["ป.1","ป.2","ป.3","ป.4","ป.5","ป.6","ม.1","ม.2","ม.3","ม.4","ม.5","ม.6","ปวช.","ปวส.","มหาวิทยาลัย","ทั่วไป"];

function genPassword(len = 10) {
  const c = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#";
  return Array.from({ length: len }, () => c[Math.floor(Math.random() * c.length)]).join("");
}

function SortIcon({ col, sort }: { col: SortKey; sort: { key: SortKey; dir: SortDir } }) {
  if (sort.key !== col) return <ChevronsUpDown className="w-3 h-3 ml-1 text-gray-300 inline" />;
  return sort.dir === "asc"
    ? <ChevronUp className="w-3 h-3 ml-1 text-violet-500 inline" />
    : <ChevronDown className="w-3 h-3 ml-1 text-violet-500 inline" />;
}

const inputCls = "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white";

export default function SuperAdminRolesPage() {
  const [users, setUsers]     = useState<UserItem[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [filterRole, setFilterRole] = useState<Role | "all">("all");
  const [filterInstitution, setFilterInstitution] = useState("all");
  const [sort, setSort]       = useState<{ key: SortKey; dir: SortDir }>({ key: "createdAt", dir: "desc" });
  const [updating, setUpdating] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string; name: string }>({ open: false, id: "", name: "" });

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [createRole, setCreateRole] = useState<Role>("admin");
  const [cf, setCf] = useState({ name: "", email: "", password: "", gradeLevel: "" });
  const [createError, setCreateError] = useState("");
  const [creating, setCreating]       = useState(false);
  const [showCPass, setShowCPass]     = useState(false);
  const [copiedC, setCopiedC]         = useState(false);

  // Edit role modal
  const [editUser, setEditUser] = useState<UserItem | null>(null);
  const [editRole, setEditRole] = useState<Role>("student");
  const [editSaving, setEditSaving] = useState(false);

  const load = async (institutionId?: string) => {
    setLoading(true);
    const qs = institutionId && institutionId !== "all" ? `?institutionId=${institutionId}` : "";
    const [usersRes, instRes] = await Promise.all([
      fetch(`/api/admin/users${qs}`),
      fetch("/api/admin/institutions"),
    ]);
    if (usersRes.ok) setUsers(await usersRes.json());
    if (instRes.ok) setInstitutions(await instRes.json());
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const institutionNames: Record<string, string> = {};
  institutions.forEach((i) => { institutionNames[i._id] = i.name; });

  const counts = useMemo(() => {
    const c = { student: 0, teacher: 0, admin: 0, super_admin: 0 };
    users.forEach((u) => { if (u.role in c) c[u.role]++; });
    return c;
  }, [users]);

  const filtered = useMemo(() => {
    let list = users.filter((u) => {
      const matchRole = filterRole === "all" || u.role === filterRole;
      const q = search.toLowerCase();
      const matchSearch = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      return matchRole && matchSearch;
    });
    list = [...list].sort((a, b) => {
      let av: string = a[sort.key] ?? "", bv: string = b[sort.key] ?? "";
      if (typeof av === "string") av = av.toLowerCase();
      if (typeof bv === "string") bv = bv.toLowerCase();
      if (av < bv) return sort.dir === "asc" ? -1 : 1;
      if (av > bv) return sort.dir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [users, filterRole, search, sort]);

  const toggleSort = (key: SortKey) => setSort((s) =>
    s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }
  );

  const changeRole = async (id: string, role: Role) => {
    setUpdating(id);
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role }),
    });
    if (res.ok) setUsers((prev) => prev.map((u) => u._id === id ? { ...u, role } : u));
    setUpdating(null);
  };

  const saveEdit = async () => {
    if (!editUser) return;
    setEditSaving(true);
    const res = await fetch(`/api/admin/users/${editUser._id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role: editRole }),
    });
    if (res.ok) {
      setUsers((prev) => prev.map((u) => u._id === editUser._id ? { ...u, role: editRole } : u));
      setEditUser(null);
    }
    setEditSaving(false);
  };

  const deleteUser = async (id: string) => {
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    if (res.ok) setUsers((prev) => prev.filter((u) => u._id !== id));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    if (!cf.password) { setCreateError("กรุณาตั้งรหัสผ่าน"); return; }
    setCreating(true);
    const res = await fetch("/api/admin/users", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: cf.name, email: cf.email, password: cf.password, role: createRole, gradeLevel: createRole === "student" ? cf.gradeLevel : "ทุกระดับชั้น", status: "approved" }),
    });
    const data = await res.json();
    if (!res.ok) setCreateError(data.error ?? "เกิดข้อผิดพลาด");
    else { setShowCreate(false); setCf({ name: "", email: "", password: "", gradeLevel: "" }); load(filterInstitution); }
    setCreating(false);
  };

  const thCls = "px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer select-none hover:text-gray-700 whitespace-nowrap";

  return (
    <div className="space-y-6">
      <ConfirmDialog
        open={deleteConfirm.open} title="ลบผู้ใช้?"
        message={`"${deleteConfirm.name}" จะถูกลบถาวร ไม่สามารถกู้คืนได้`}
        confirmLabel="ลบ" type="danger"
        onConfirm={() => deleteUser(deleteConfirm.id)}
        onCancel={() => setDeleteConfirm((d) => ({ ...d, open: false }))}
      />

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">จัดการ Role</h1>
          <p className="text-gray-500 text-sm mt-1">ตาราง Master สิทธิ์การใช้งานของผู้ใช้ทั้งหมดในระบบ</p>
        </div>
        <button onClick={() => { setShowCreate(true); setCf({ name: "", email: "", password: "", gradeLevel: "" }); setCreateError(""); setCreateRole("admin"); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> สร้างผู้ใช้ใหม่
        </button>
      </div>

      {/* Role summary strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {(Object.entries(ROLE_DEF) as [Role, typeof ROLE_DEF[Role]][]).map(([key, r]) => {
          const Icon = r.icon;
          const active = filterRole === key;
          return (
            <button key={key} onClick={() => setFilterRole(active ? "all" : key)}
              className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all ${active ? `${r.badge} ${r.border}` : "bg-white border-gray-200 hover:border-gray-300"}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${r.badge}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-gray-900 text-sm">{r.label}</div>
                <div className="text-2xl font-extrabold text-gray-900">{counts[key]}<span className="text-xs font-normal text-gray-400 ml-1">คน</span></div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Filter bar */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหาชื่อ หรืออีเมล..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white" />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Institution filter */}
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <select
            value={filterInstitution}
            onChange={(e) => { setFilterInstitution(e.target.value); load(e.target.value); }}
            className="pl-9 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 appearance-none cursor-pointer"
          >
            <option value="all">ทุกสถาบัน</option>
            {institutions.map((i) => (
              <option key={i._id} value={i._id}>{i.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        </div>

        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilterRole("all")}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${filterRole === "all" ? "bg-violet-600 text-white shadow-sm" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
            ทั้งหมด <span className="ml-1 opacity-70">{users.length}</span>
          </button>
          {(Object.entries(ROLE_DEF) as [Role, typeof ROLE_DEF[Role]][]).map(([key, r]) => {
            const Icon = r.icon;
            return (
              <button key={key} onClick={() => setFilterRole(filterRole === key ? "all" : key)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${filterRole === key ? "bg-violet-600 text-white shadow-sm" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                <Icon className="w-3.5 h-3.5" />{r.label} <span className="opacity-70">{counts[key]}</span>
              </button>
            );
          })}
        </div>
        <span className="text-xs text-gray-400 ml-auto whitespace-nowrap">แสดง {filtered.length} / {users.length} รายการ</span>
      </div>

      {/* Master Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/80">
              <th className={thCls} onClick={() => toggleSort("name")}>
                ผู้ใช้ <SortIcon col="name" sort={sort} />
              </th>
              <th className={thCls} onClick={() => toggleSort("email")}>
                อีเมล <SortIcon col="email" sort={sort} />
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                สถาบัน
              </th>
              <th className={thCls} onClick={() => toggleSort("role")}>
                Role <SortIcon col="role" sort={sort} />
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                เปลี่ยน Role
              </th>
              <th className={thCls} onClick={() => toggleSort("status")}>
                สถานะ <SortIcon col="status" sort={sort} />
              </th>
              <th className={thCls} onClick={() => toggleSort("createdAt")}>
                วันที่สมัคร <SortIcon col="createdAt" sort={sort} />
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
                จัดการ
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={8} className="text-center py-16 text-gray-400">กำลังโหลด...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-16 text-gray-400">ไม่พบผู้ใช้</td></tr>
            ) : filtered.map((u) => {
              const rd = ROLE_DEF[u.role];
              const sd = STATUS_DEF[u.status];
              const Icon = rd.icon;
              return (
                <tr key={u._id} className="hover:bg-violet-50/30 transition-colors group">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${rd.badge}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{u.name}</p>
                        {u.gradeLevel && <p className="text-xs text-gray-400">{u.gradeLevel}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-sm text-gray-600">{u.email}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    {u.role === "super_admin" ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full">
                        <Building2 className="w-3 h-3" />ทุกสถาบัน
                      </span>
                    ) : u.institutionId ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full">
                        <Building2 className="w-3 h-3" />{institutionNames[u.institutionId] ?? "สถาบัน"}
                      </span>
                    ) : <span className="text-gray-300 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${rd.badge}`}>
                      <Icon className="w-3 h-3" />{rd.label}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="relative inline-block">
                      <select value={u.role} disabled={updating === u._id}
                        onChange={(e) => changeRole(u._id, e.target.value as Role)}
                        className={`appearance-none pl-3 pr-7 py-1.5 rounded-lg text-xs font-semibold border-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-400 disabled:opacity-40 transition-colors ${rd.badge} ${rd.border}`}>
                        {(Object.entries(ROLE_DEF) as [Role, typeof ROLE_DEF[Role]][]).map(([k, r]) => (
                          <option key={k} value={k}>{r.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" />
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold ${sd.cls}`}>
                      {sd.label}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-400 whitespace-nowrap">
                    {new Date(u.createdAt).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditUser(u); setEditRole(u.role); }}
                        className="p-1.5 text-gray-400 hover:text-violet-600 hover:bg-violet-100 rounded-lg transition-colors" title="แก้ไข Role">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteConfirm({ open: true, id: u._id, name: u.name })}
                        className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="ลบผู้ใช้">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {!loading && filtered.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-3 bg-gray-50/50 flex items-center justify-between">
            <p className="text-xs text-gray-400">แสดง {filtered.length} จาก {users.length} รายการ</p>
            <div className="flex gap-4 text-xs text-gray-400">
              {(Object.entries(ROLE_DEF) as [Role, typeof ROLE_DEF[Role]][]).map(([key, r]) => (
                <span key={key} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${r.badge}`}>
                  {r.label}: {counts[key]}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-900">สร้างผู้ใช้ใหม่</h2>
                <p className="text-xs text-gray-400 mt-0.5">บัญชีจะถูกอนุมัติทันที</p>
              </div>
              <button onClick={() => setShowCreate(false)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="px-6 py-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">เลือก Role</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.entries(ROLE_DEF) as [Role, typeof ROLE_DEF[Role]][]).map(([key, r]) => {
                      const Icon = r.icon;
                      const active = createRole === key;
                      return (
                        <button key={key} type="button" onClick={() => setCreateRole(key)}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all text-left ${active ? `${r.badge} ${r.border}` : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                          <Icon className="w-4 h-4 shrink-0" />{r.label}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-violet-500 mt-2 bg-violet-50 px-3 py-2 rounded-xl">
                    {ROLE_DEF[createRole].desc}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">ชื่อ-นามสกุล</label>
                  <input required value={cf.name} onChange={(e) => setCf({ ...cf, name: e.target.value })} className={inputCls} placeholder="ชื่อ-นามสกุล" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">อีเมล</label>
                  <input required type="email" value={cf.email} onChange={(e) => setCf({ ...cf, email: e.target.value })} className={inputCls} placeholder="อีเมล" />
                </div>
                {createRole === "student" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">ระดับชั้น</label>
                    <select value={cf.gradeLevel} onChange={(e) => setCf({ ...cf, gradeLevel: e.target.value })} className={inputCls}>
                      <option value="">— ไม่ระบุ —</option>
                      {GRADE_LEVELS.map((g) => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">รหัสผ่าน</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input required type={showCPass ? "text" : "password"} value={cf.password}
                        onChange={(e) => setCf({ ...cf, password: e.target.value })} placeholder="รหัสผ่าน" className={`${inputCls} pr-10`} />
                      <button type="button" onClick={() => setShowCPass(!showCPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showCPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {cf.password && (
                      <button type="button" onClick={() => { navigator.clipboard.writeText(cf.password); setCopiedC(true); setTimeout(() => setCopiedC(false), 2000); }}
                        className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-colors">
                        {copiedC ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    )}
                    <button type="button" onClick={() => { setCf({ ...cf, password: genPassword() }); setShowCPass(true); }}
                      className="px-3 py-2.5 bg-violet-50 hover:bg-violet-100 text-violet-600 text-xs font-semibold rounded-xl whitespace-nowrap">
                      Auto
                    </button>
                  </div>
                  {cf.password && (
                    <p className="text-xs text-violet-600 mt-1.5 font-mono bg-violet-50 px-3 py-1.5 rounded-lg">{cf.password}</p>
                  )}
                </div>
                {createError && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-xl">{createError}</p>}
              </div>
              <div className="flex gap-3 px-6 py-5 border-t border-gray-100">
                <button type="submit" disabled={creating}
                  className="flex-1 py-2.5 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 disabled:opacity-50 transition-colors text-sm">
                  {creating ? "กำลังสร้าง..." : "สร้างผู้ใช้"}
                </button>
                <button type="button" onClick={() => setShowCreate(false)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors text-sm">
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">เปลี่ยน Role</h2>
              <button onClick={() => setEditUser(null)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className={`flex items-center gap-3 p-4 rounded-2xl border-2 ${ROLE_DEF[editUser.role].border} ${ROLE_DEF[editUser.role].badge}`}>
                {(() => { const Icon = ROLE_DEF[editUser.role].icon; return <Icon className="w-5 h-5 shrink-0" />; })()}
                <div>
                  <p className="font-semibold text-sm">{editUser.name}</p>
                  <p className="text-xs opacity-70">{editUser.email}</p>
                </div>
                <span className="ml-auto text-xs font-bold opacity-70">{ROLE_DEF[editUser.role].label}</span>
              </div>
              <div className="space-y-2">
                {(Object.entries(ROLE_DEF) as [Role, typeof ROLE_DEF[Role]][]).map(([key, r]) => {
                  const Icon = r.icon;
                  const active = editRole === key;
                  return (
                    <button key={key} type="button" onClick={() => setEditRole(key)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${active ? `${r.badge} ${r.border}` : "border-gray-200 hover:border-gray-300 bg-white"}`}>
                      <Icon className={`w-4 h-4 shrink-0 ${active ? "" : "text-gray-400"}`} />
                      <div className="flex-1">
                        <p className={`text-sm font-semibold ${active ? "" : "text-gray-700"}`}>{r.label}</p>
                        <p className={`text-xs mt-0.5 ${active ? "opacity-70" : "text-gray-400"}`}>{r.desc}</p>
                      </div>
                      {active && <Check className="w-4 h-4 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex gap-3 px-6 py-5 border-t border-gray-100">
              <button onClick={saveEdit} disabled={editSaving}
                className="flex-1 py-2.5 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 disabled:opacity-50 transition-colors text-sm">
                {editSaving ? "กำลังบันทึก..." : "บันทึก"}
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
