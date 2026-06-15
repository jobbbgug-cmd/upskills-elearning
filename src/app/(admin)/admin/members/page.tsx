"use client";
import { useState, useEffect, useCallback } from "react";
import { Clock, CheckCircle, XCircle, Copy, Check, User, GraduationCap, Shield, ShieldCheck, RefreshCw } from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

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
}

interface ApproveResult {
  userId: string;
  password: string;
  name: string;
  email: string;
  role: string;
}

export default function AdminMembersPage() {
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [approved, setApproved] = useState<ApproveResult[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; type: "approve" | "reject"; user: PendingUser | null }>({ open: false, type: "approve", user: null });
  const [copied, setCopied] = useState<string | null>(null);
  const [tab, setTab] = useState<"pending" | "all">("pending");
  const [allUsers, setAllUsers] = useState<PendingUser[]>([]);

  const loadPending = useCallback(async () => {
    setLoading(true);
    const [rPending, rAll] = await Promise.all([
      fetch("/api/admin/users/pending"),
      fetch("/api/admin/users"),
    ]);
    if (rPending.ok) setUsers(await rPending.json());
    if (rAll.ok) setAllUsers(await rAll.json());
    setLoading(false);
  }, []);

  useEffect(() => { loadPending(); }, [loadPending]);

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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">จัดการผู้สมัครสมาชิก</h1>
          <p className="text-gray-500 text-sm mt-1">อนุมัติหรือปฏิเสธคำขอสมัครสมาชิก</p>
        </div>
        <button onClick={loadPending} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
          <RefreshCw className="w-4 h-4" />
          รีเฟรช
        </button>
      </div>

      {/* Approved password cards — shown after approving */}
      {approved.length > 0 && (
        <div className="mb-8 space-y-3">
          <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            รหัสผ่านที่สร้างขึ้น — กรุณา copy และส่งให้ผู้ใช้ทันที
          </p>
          {approved.map((a) => (
            <div key={a.userId} className="bg-green-50 border border-green-200 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-900">{a.name}</p>
                  <p className="text-sm text-gray-500">{a.email} · {roleLabel(a.role)}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="bg-white border border-green-300 rounded-xl px-4 py-2 font-mono text-lg font-bold text-gray-900 tracking-widest">
                      {a.password}
                    </div>
                    <button
                      onClick={() => copyText(a.password, a.userId)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-colors"
                    >
                      {copied === a.userId ? <><Check className="w-4 h-4" /> copied!</> : <><Copy className="w-4 h-4" /> Copy</>}
                    </button>
                  </div>
                  <p className="text-xs text-green-700 mt-2">📋 ข้อความสำหรับส่งให้ผู้ใช้:</p>
                  <button
                    onClick={() => copyText(
                      `ยินดีต้อนรับสู่ UPSkills! 🎉\nชื่อผู้ใช้: ${a.email}\nรหัสผ่าน: ${a.password}\nเข้าสู่ระบบ: ${window.location.origin}/login`,
                      `msg-${a.userId}`
                    )}
                    className="mt-1 text-xs text-green-600 underline hover:text-green-800"
                  >
                    {copied === `msg-${a.userId}` ? "✓ copied!" : "copy ข้อความทั้งหมด"}
                  </button>
                </div>
                <button onClick={() => setApproved((prev) => prev.filter((x) => x.userId !== a.userId))} className="text-gray-300 hover:text-gray-500 text-lg leading-none">✕</button>
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
          <div className="text-center py-16 text-gray-400">กำลังโหลด...</div>
        ) : users.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">ไม่มีคำขอที่รออนุมัติ</p>
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((u) => (
              <div key={u._id} className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${roleBadge(u.role)}`}>
                  {roleIcon(u.role)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900">{u.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleBadge(u.role)}`}>{roleLabel(u.role)}</span>
                    {u.gradeLevel && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{u.gradeLevel}</span>}
                  </div>
                  <p className="text-sm text-gray-400 mt-0.5">{u.email}</p>
                  {u.contactChannel && (
                    <div className="inline-flex items-center gap-1.5 mt-1.5 bg-violet-50 border border-violet-200 rounded-lg px-2.5 py-1 text-xs text-violet-700 font-medium">
                      <span>📨 ส่งทาง {u.contactChannel}:</span>
                      <span className="font-bold">{u.contactId}</span>
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    สมัครเมื่อ {new Date(u.createdAt).toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setConfirmDialog({ open: true, type: "approve", user: u })}
                    disabled={processing === u._id}
                    className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {processing === u._id ? "กำลังดำเนินการ..." : "อนุมัติ"}
                  </button>
                  <button
                    onClick={() => setConfirmDialog({ open: true, type: "reject", user: u })}
                    disabled={processing === u._id}
                    className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 text-sm font-semibold rounded-xl hover:bg-red-100 disabled:opacity-50 transition-colors border border-red-200"
                  >
                    <XCircle className="w-4 h-4" />
                    ปฏิเสธ
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* All users tab */}
      {tab === "all" && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">ผู้ใช้</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">ประเภท</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">ระดับชั้น</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">วันที่สมัคร</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {allUsers.filter(u => u.role !== "admin").map((u) => (
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
                  <td className="px-5 py-3.5 text-sm text-gray-500">{u.gradeLevel || "—"}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">
                    {new Date(u.createdAt).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-5 py-3.5">{statusBadge(u.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
