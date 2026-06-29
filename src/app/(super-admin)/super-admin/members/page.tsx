"use client";
import { useState, useEffect, useCallback } from "react";
import { Clock, CheckCircle, XCircle, Copy, Check, User, GraduationCap, Shield, ShieldCheck, RefreshCw, Building2, ChevronDown, Trash2 } from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import LoadingSpinner from "@/components/LoadingSpinner";

interface PendingUser {
  _id: string;
  name: string;
  email: string;
  role: "student" | "teacher" | "admin" | "super_admin";
  gradeLevel?: string;
  status: "pending" | "approved" | "rejected";
  contactChannel?: string;
  contactId?: string;
  createdAt: string;
  institutionId?: string;
}

interface ApproveResult {
  userId: string;
  password: string;
  name: string;
  email: string;
  role: string;
}

interface Institution {
  _id: string;
  name: string;
}

export default function SuperAdminMembersPage() {
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [approved, setApproved] = useState<ApproveResult[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; type: "approve" | "reject"; user: PendingUser | null }>({ open: false, type: "approve", user: null });
  const [copied, setCopied] = useState<string | null>(null);
  const [tab, setTab] = useState<"pending" | "all">("pending");
  const [allUsers, setAllUsers] = useState<PendingUser[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [filterInstitution, setFilterInstitution] = useState("all");

  const loadPending = useCallback(async (institutionId?: string) => {
    setLoading(true);
    const qs = institutionId && institutionId !== "all" ? `?institutionId=${institutionId}` : "";
    const [rPending, rAll] = await Promise.all([
      fetch(`/api/admin/users/pending${qs}`),
      fetch(`/api/admin/users${qs}`),
    ]);
    if (rPending.ok) setUsers(await rPending.json());
    if (rAll.ok) setAllUsers(await rAll.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    const init = async () => {
      const instRes = await fetch("/api/admin/institutions");
      if (instRes.ok) setInstitutions(await instRes.json());
      loadPending();
    };
    init();
  }, [loadPending]);

  const handleInstitutionChange = (val: string) => {
    setFilterInstitution(val);
    loadPending(val);
  };

  const doApprove = async (user: PendingUser) => {
    setProcessing(user._id);
    const res = await fetch(`/api/admin/users/${user._id}/approve`, { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      setApproved((prev) => [...prev, { userId: user._id, password: data.password, name: user.name, email: user.email, role: user.role }]);
      setUsers((prev) => prev.filter((u) => u._id !== user._id));
      setAllUsers((prev) => prev.map((u) => u._id === user._id ? { ...u, status: "approved" } : u));
    }
    setProcessing(null);
  };

  const doReject = async (id: string) => {
    setProcessing(id);
    await fetch(`/api/admin/users/${id}/reject`, { method: "POST" });
    setUsers((prev) => prev.filter((u) => u._id !== id));
    setAllUsers((prev) => prev.map((u) => u._id === id ? { ...u, status: "rejected" } : u));
    setProcessing(null);
  };

  const doDelete = async (id: string, name: string) => {
    if (!confirm(`ลบ "${name}" ออกจากระบบ?`)) return;
    setProcessing(id);
    await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    setUsers((prev) => prev.filter((u) => u._id !== id));
    setAllUsers((prev) => prev.filter((u) => u._id !== id));
    setProcessing(null);
  };

  const handleConfirmAction = () => {
    const { type, user } = confirmDialog;
    if (!user) return;
    if (type === "approve") doApprove(user);
    else doReject(user._id);
  };

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const institutionNames: Record<string, string> = {};
  institutions.forEach((i) => { institutionNames[i._id] = i.name; });

  const ROLE_MAP: Record<string, { label: string; badge: string; icon: React.ReactNode }> = {
    student:     { label: "นักเรียน",   badge: "bg-blue-100 text-blue-700",    icon: <User className="w-4 h-4 text-blue-600" /> },
    teacher:     { label: "ครู",         badge: "bg-green-100 text-green-700",  icon: <GraduationCap className="w-4 h-4 text-green-600" /> },
    admin:       { label: "Admin",       badge: "bg-purple-100 text-purple-700",icon: <Shield className="w-4 h-4 text-purple-600" /> },
    super_admin: { label: "Super Admin", badge: "bg-rose-100 text-rose-700",    icon: <ShieldCheck className="w-4 h-4 text-rose-600" /> },
  };
  const roleLabel = (role: string) => ROLE_MAP[role]?.label ?? role;
  const roleIcon  = (role: string) => ROLE_MAP[role]?.icon ?? <User className="w-4 h-4 text-gray-400" />;
  const roleBadge = (role: string) => ROLE_MAP[role]?.badge ?? "bg-gray-100 text-gray-600";

  const statusBadge = (status: string) => {
    if (status === "approved") return <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700"><CheckCircle className="w-3 h-3" />อนุมัติแล้ว</span>;
    if (status === "rejected") return <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700"><XCircle className="w-3 h-3" />ปฏิเสธ</span>;
    return <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700"><Clock className="w-3 h-3" />รออนุมัติ</span>;
  };

  return (
    <div>
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.type === "approve" ? `อนุมัติ ${confirmDialog.user?.name}?` : `ปฏิเสธ ${confirmDialog.user?.name}?`}
        message={confirmDialog.type === "approve" ? "ระบบจะสร้างรหัสผ่านและส่งให้ผู้ใช้" : "คำขอสมัครสมาชิกนี้จะถูกปฏิเสธ"}
        confirmLabel={confirmDialog.type === "approve" ? "อนุมัติ" : "ปฏิเสธ"}
        type={confirmDialog.type === "approve" ? "success" : "danger"}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmDialog((d) => ({ ...d, open: false }))}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">อนุมัติสมาชิก</h1>
          <p className="text-gray-500 text-xs md:text-sm mt-1">อนุมัติหรือปฏิเสธคำขอสมัครสมาชิก — ทุกสถาบัน</p>
        </div>
        <button onClick={() => loadPending(filterInstitution)} className="flex items-center justify-center gap-2 px-3 py-2 text-xs md:text-sm text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors whitespace-nowrap">
          <RefreshCw className="w-4 h-4" />
          รีเฟรช
        </button>
      </div>

      {/* Institution filter */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <select
            value={filterInstitution}
            onChange={(e) => handleInstitutionChange(e.target.value)}
            className="pl-9 pr-8 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 appearance-none cursor-pointer"
          >
            <option value="all">ทุกสถาบัน</option>
            {institutions.map((i) => (
              <option key={i._id} value={i._id}>{i.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Approved password cards */}
      {approved.length > 0 && (
        <div className="mb-8 space-y-3">
          <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            รหัสผ่านที่สร้างขึ้น — กรุณา copy และส่งให้ผู้ใช้ทันที
          </p>
          {approved.map((a) => (
            <div key={a.userId} className="bg-green-50 border border-green-200 rounded-xl md:rounded-2xl p-4 md:p-5">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm md:text-base text-gray-900 break-words">{a.name}</p>
                  <p className="text-xs md:text-sm text-gray-500 break-all">{a.email} · {roleLabel(a.role)}</p>
                  <div className="mt-3 flex flex-col gap-2">
                    <div className="bg-white border border-green-300 rounded-lg md:rounded-xl px-3 md:px-4 py-2 font-mono text-sm md:text-lg font-bold text-gray-900 tracking-widest break-all">
                      {a.password}
                    </div>
                    <button
                      onClick={() => copyText(a.password, a.userId)}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 bg-green-600 text-white text-xs md:text-sm font-medium rounded-lg md:rounded-xl hover:bg-green-700 transition-colors w-full md:w-auto"
                    >
                      {copied === a.userId ? <><Check className="w-4 h-4" /> copied!</> : <><Copy className="w-4 h-4" /> Copy</>}
                    </button>
                  </div>
                  <p className="text-xs text-green-700 mt-3">ข้อความสำหรับส่งให้ผู้ใช้:</p>
                  <button
                    onClick={() => copyText(
                      `ยินดีต้อนรับสู่ UPSkills!\nชื่อผู้ใช้: ${a.email}\nรหัสผ่าน: ${a.password}\nเข้าสู่ระบบ: ${window.location.origin}/login`,
                      `msg-${a.userId}`
                    )}
                    className="mt-1 text-xs text-green-600 underline hover:text-green-800 block"
                  >
                    {copied === `msg-${a.userId}` ? "copied!" : "copy ข้อความทั้งหมด"}
                  </button>
                </div>
                <button onClick={() => setApproved((prev) => prev.filter((x) => x.userId !== a.userId))} className="text-gray-300 hover:text-gray-500 text-lg leading-none self-start md:self-auto shrink-0 p-1">×</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-6">
        {[
          { key: "pending", label: `รออนุมัติ (${users.length})` },
          { key: "all", label: "ทั้งหมด" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as typeof tab)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.key ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Pending tab */}
      {tab === "pending" && (
        loading ? (
          <LoadingSpinner />
        ) : users.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">ไม่มีคำขอที่รออนุมัติ</p>
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((u) => (
              <div key={u._id} className="bg-white rounded-xl md:rounded-2xl border border-gray-200 p-4 md:p-5 flex flex-col md:flex-row md:items-center md:gap-4 gap-3">
                <div className={`w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center shrink-0 ${roleBadge(u.role)}`}>
                  {roleIcon(u.role)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-sm md:text-base text-gray-900 break-words">{u.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleBadge(u.role)}`}>{roleLabel(u.role)}</span>
                    {u.gradeLevel && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{u.gradeLevel}</span>}
                    {u.institutionId && (
                      <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full">
                        <Building2 className="w-3 h-3" /><span className="truncate">{institutionNames[u.institutionId] ?? "สถาบัน"}</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs md:text-sm text-gray-400 mt-1 break-all">{u.email}</p>
                  {u.contactChannel && (
                    <div className="flex items-center gap-1.5 mt-2 bg-violet-50 border border-violet-200 rounded-lg px-2 md:px-2.5 py-1 text-xs text-violet-700 font-medium flex-wrap">
                      <span className="shrink-0">ส่งทาง {u.contactChannel}:</span>
                      <span className="font-bold break-all">{u.contactId}</span>
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    สมัครเมื่อ {new Date(u.createdAt).toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row md:flex-row gap-2 md:gap-2 md:shrink-0 w-full md:w-auto">
                  <button
                    onClick={() => setConfirmDialog({ open: true, type: "approve", user: u })}
                    disabled={processing === u._id}
                    className="flex items-center justify-center gap-1.5 px-3 md:px-4 py-2 bg-green-600 text-white text-xs md:text-sm font-semibold rounded-lg md:rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors flex-1 md:flex-none"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span className="truncate">{processing === u._id ? "กำลังดำเนินการ..." : "อนุมัติ"}</span>
                  </button>
                  <button
                    onClick={() => setConfirmDialog({ open: true, type: "reject", user: u })}
                    disabled={processing === u._id}
                    className="flex items-center justify-center gap-1.5 px-3 md:px-4 py-2 bg-red-50 text-red-600 text-xs md:text-sm font-semibold rounded-lg md:rounded-xl hover:bg-red-100 disabled:opacity-50 transition-colors border border-red-200 flex-1 md:flex-none"
                  >
                    <XCircle className="w-4 h-4" />
                    <span className="truncate">ปฏิเสธ</span>
                  </button>
                  <button
                    onClick={() => doDelete(u._id, u.name)}
                    disabled={processing === u._id}
                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg md:rounded-xl transition-colors disabled:opacity-50 md:shrink-0"
                    title="ลบ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* All users tab */}
      {tab === "all" && (
        <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 overflow-x-auto">
          <table className="w-full min-w-max">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">ผู้ใช้</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">ประเภท</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">สถาบัน</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">ระดับชั้น</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">วันที่สมัคร</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">สถานะ</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {allUsers.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50">
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-medium text-gray-900">{u.name}</p>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${roleBadge(u.role)}`}>
                      {roleIcon(u.role)}{roleLabel(u.role)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {u.institutionId ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full">
                        <Building2 className="w-3 h-3" />{institutionNames[u.institutionId] ?? "สถาบัน"}
                      </span>
                    ) : <span className="text-gray-300 text-xs">—</span>}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">{u.gradeLevel || "—"}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">
                    {new Date(u.createdAt).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-5 py-3.5">{statusBadge(u.status)}</td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => doDelete(u._id, u.name)}
                      disabled={processing === u._id}
                      className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="ลบ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
