"use client";
import { useState, useEffect, useCallback } from "react";
import { Search, RefreshCw, LogIn, BookOpen, Users, Settings, Receipt, Building2, Shield, ChevronLeft, ChevronRight, MousePointerClick, Send } from "lucide-react";

interface LogEntry {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  institutionId: string | null;
  institutionName: string | null;
  action: string;
  description: string;
  ipAddress: string | null;
  createdAt: string;
}

const ACTION_LABELS: Record<string, string> = {
  login:               "เข้าสู่ระบบ",
  logout:              "ออกจากระบบ",
  create_course:       "สร้างคอร์ส",
  update_course:       "แก้ไขคอร์ส",
  delete_course:       "ลบคอร์ส",
  approve_booking:     "อนุมัติการจอง",
  reject_booking:      "ปฏิเสธการจอง",
  approve_member:      "อนุมัติสมาชิก",
  reject_member:       "ปฏิเสธสมาชิก",
  create_payout:       "สร้าง Payout",
  update_payout:       "อัปเดต Payout",
  create_institution:  "สร้างสถาบัน",
  update_institution:  "แก้ไขสถาบัน",
  update_settings:     "แก้ไขการตั้งค่า",
  trial_button_click:  "กดปุ่มทดลองใช้งาน",
  trial_form_submit:   "ส่งข้อมูลทดลองใช้งาน",
};

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  admin:       "Admin",
  owner:       "Owner",
  teacher:     "ครู",
  guest:       "ผู้เยี่ยมชม",
};

const ACTION_ICONS: Record<string, React.ReactNode> = {
  login:               <LogIn className="w-3.5 h-3.5" />,
  logout:              <LogIn className="w-3.5 h-3.5" />,
  create_course:       <BookOpen className="w-3.5 h-3.5" />,
  update_course:       <BookOpen className="w-3.5 h-3.5" />,
  delete_course:       <BookOpen className="w-3.5 h-3.5" />,
  approve_booking:     <Users className="w-3.5 h-3.5" />,
  reject_booking:      <Users className="w-3.5 h-3.5" />,
  approve_member:      <Users className="w-3.5 h-3.5" />,
  reject_member:       <Users className="w-3.5 h-3.5" />,
  create_payout:       <Receipt className="w-3.5 h-3.5" />,
  update_payout:       <Receipt className="w-3.5 h-3.5" />,
  create_institution:  <Building2 className="w-3.5 h-3.5" />,
  update_institution:  <Building2 className="w-3.5 h-3.5" />,
  update_settings:     <Settings className="w-3.5 h-3.5" />,
  trial_button_click:  <MousePointerClick className="w-3.5 h-3.5" />,
  trial_form_submit:   <Send className="w-3.5 h-3.5" />,
};

const ACTION_COLORS: Record<string, string> = {
  login:               "bg-blue-50 text-blue-700",
  logout:              "bg-gray-100 text-gray-600",
  create_course:       "bg-green-50 text-green-700",
  update_course:       "bg-yellow-50 text-yellow-700",
  delete_course:       "bg-red-50 text-red-700",
  approve_booking:     "bg-green-50 text-green-700",
  reject_booking:      "bg-red-50 text-red-700",
  approve_member:      "bg-green-50 text-green-700",
  reject_member:       "bg-red-50 text-red-700",
  create_payout:       "bg-violet-50 text-violet-700",
  update_payout:       "bg-violet-50 text-violet-700",
  create_institution:  "bg-indigo-50 text-indigo-700",
  update_institution:  "bg-indigo-50 text-indigo-700",
  update_settings:     "bg-orange-50 text-orange-700",
  trial_button_click:  "bg-teal-50 text-teal-700",
  trial_form_submit:   "bg-teal-100 text-teal-800",
};

const ROLE_BADGE: Record<string, string> = {
  super_admin: "bg-violet-100 text-violet-700",
  admin:       "bg-blue-100 text-blue-700",
  owner:       "bg-indigo-100 text-indigo-700",
  teacher:     "bg-green-100 text-green-700",
  guest:       "bg-gray-100 text-gray-500",
};

const LIMIT = 50;

export default function ActivityLogsPage() {
  const [logs, setLogs]         = useState<LogEntry[]>([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [loading, setLoading]   = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const [filterRole,   setFilterRole]   = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [filterSearch, setFilterSearch] = useState("");
  const [dateFrom,     setDateFrom]     = useState("");
  const [dateTo,       setDateTo]       = useState("");

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    const qs = new URLSearchParams({
      page:  String(p),
      limit: String(LIMIT),
      ...(filterRole   ? { role:   filterRole }   : {}),
      ...(filterAction ? { action: filterAction } : {}),
      ...(dateFrom     ? { dateFrom }             : {}),
      ...(dateTo       ? { dateTo }               : {}),
    });
    const res = await fetch(`/api/super-admin/activity-logs?${qs}`);
    if (res.ok) {
      const data = await res.json();
      setLogs(data.logs ?? []);
      setTotal(data.total ?? 0);
      setPage(p);
      if (data.isSuperAdmin !== undefined) setIsSuperAdmin(data.isSuperAdmin);
    }
    setLoading(false);
  }, [filterRole, filterAction, dateFrom, dateTo]);

  useEffect(() => { load(1); }, [load]);

  const filtered = filterSearch
    ? logs.filter((l) => {
        const q = filterSearch.toLowerCase();
        return l.userName.toLowerCase().includes(q) || l.userEmail.toLowerCase().includes(q) || l.description.toLowerCase().includes(q);
      })
    : logs;

  const totalPages = Math.ceil(total / LIMIT);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("th-TH", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ประวัติการใช้งาน</h1>
          <p className="text-gray-500 text-sm mt-1">บันทึกการเข้าสู่ระบบและการดำเนินการของ Admin</p>
        </div>
        <button onClick={() => load(1)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
          <RefreshCw className="w-4 h-4" />รีเฟรช
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
            placeholder="ค้นหาชื่อ อีเมล หรือรายละเอียด..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
          />
        </div>

        <select value={filterRole} onChange={(e) => { setFilterRole(e.target.value); }} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500">
          <option value="">ทุก Role</option>
          <option value="super_admin">Super Admin</option>
          <option value="admin">Admin</option>
          <option value="owner">Owner</option>
          {isSuperAdmin && <option value="guest">ผู้เยี่ยมชม</option>}
        </select>

        <select value={filterAction} onChange={(e) => { setFilterAction(e.target.value); }} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500">
          <option value="">ทุกการดำเนินการ</option>
          {Object.entries(ACTION_LABELS)
            .filter(([k]) => isSuperAdmin || !["trial_button_click", "trial_form_submit"].includes(k))
            .map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
        </select>

        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500" />
        <input type="date" value={dateTo}   onChange={(e) => setDateTo(e.target.value)}   className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="text-2xl font-bold text-gray-900">{total}</div>
          <div className="text-sm text-gray-500 mt-0.5">กิจกรรมทั้งหมด</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="text-2xl font-bold text-blue-600">{logs.filter((l) => l.action === "login").length}</div>
          <div className="text-sm text-gray-500 mt-0.5">เข้าสู่ระบบ (หน้านี้)</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="text-2xl font-bold text-violet-600">{new Set(logs.map((l) => l.userId)).size}</div>
          <div className="text-sm text-gray-500 mt-0.5">ผู้ใช้งาน (หน้านี้)</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-gray-400">กำลังโหลด...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
            ไม่พบข้อมูล
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">วันเวลา</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">ผู้ใช้งาน</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">สถาบัน</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">การดำเนินการ</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">รายละเอียด</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((l) => (
                <tr key={l._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 text-xs text-gray-400 whitespace-nowrap">{formatDate(l.createdAt)}</td>
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-medium text-gray-900">{l.userName}</p>
                    <p className="text-xs text-gray-400">{l.userEmail}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full font-medium ${ROLE_BADGE[l.userRole] ?? "bg-gray-100 text-gray-600"}`}>
                      {ROLE_LABELS[l.userRole] ?? l.userRole}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">
                    {l.institutionName ? (
                      <span className="inline-flex items-center gap-1 text-xs text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full font-medium">
                        <Building2 className="w-3 h-3" />{l.institutionName}
                      </span>
                    ) : <span className="text-gray-300 text-xs">—</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${ACTION_COLORS[l.action] ?? "bg-gray-100 text-gray-600"}`}>
                      {ACTION_ICONS[l.action]}
                      {ACTION_LABELS[l.action] ?? l.action}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{l.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-gray-400">แสดง {((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, total)} จาก {total} รายการ</p>
          <div className="flex gap-2">
            <button onClick={() => load(page - 1)} disabled={page <= 1} className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-2 text-sm text-gray-600">หน้า {page} / {totalPages}</span>
            <button onClick={() => load(page + 1)} disabled={page >= totalPages} className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
