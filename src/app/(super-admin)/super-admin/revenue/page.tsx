"use client";
import { useEffect, useState, useMemo } from "react";
import { TrendingUp, Users, Clock, BookOpen, ChevronUp, ChevronDown, Minus, ChevronRight, Building2, CheckCircle, Eye, X } from "lucide-react";

interface CourseStat {
  _id: string;
  title: string;
  instructor: string;
  instructorId: string;
  price: number;
  confirmedBookings: number;
  pendingBookings: number;
  revenue: number;
  commissionAmount: number;
  pendingRevenue: number;
  pendingCommission: number;
  commissionRate: number;
  byMonth: Record<string, number>;
}

interface TeacherGroup {
  instructor: string;
  instructorId: string;
  courses: CourseStat[];
  totalRevenue: number;
  totalConfirmed: number;
  totalPending: number;
}

interface MonthlyData { month: string; revenue: number; commission: number; }

interface PayoutRecord {
  _id: string;
  netPayout: number;
  status: string;
  paidAt: string | null;
  periodLabel: string;
  slipUrl: string;
  note: string;
}

interface RevenueData {
  role: "admin" | "teacher";
  courseStats: CourseStat[];
  monthly: MonthlyData[];
  totalRevenue: number;
  totalCommissionAmount: number;
  totalPending: number;
  totalPendingCommission: number;
  totalConfirmed: number;
  byTeacher: TeacherGroup[] | null;
  commissionRate: number;
  outstanding: number;
  paidNetPayout: number;
  payoutHistory: PayoutRecord[];
}

interface Institution { _id: string; name: string; }

const fmt = (n: number) => n.toLocaleString("th-TH");
const MONTHS_TH = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
function monthLabel(m: string) {
  const [y, mo] = m.split("-");
  return `${MONTHS_TH[Number(mo) - 1]} ${String(Number(y) + 543).slice(2)}`;
}

function SortIcon({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
  if (!active) return <Minus className="w-3 h-3 text-gray-300" />;
  return dir === "desc" ? <ChevronDown className="w-3 h-3 text-violet-500" /> : <ChevronUp className="w-3 h-3 text-violet-500" />;
}

function CourseTable({ courses, showInstructor = false }: {
  courses: CourseStat[];
  showInstructor?: boolean;
}) {
  const [sortKey, setSortKey] = useState<"revenue" | "confirmedBookings">("revenue");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");
  const sorted = [...courses].sort((a, b) => {
    const d = a[sortKey] - b[sortKey];
    return sortDir === "desc" ? -d : d;
  });
  const totalGrossRevenue = courses.reduce((s, c) => s + c.revenue, 0);
  const totalCommission = courses.reduce((s, c) => s + c.commissionAmount, 0);
  const totalNet = totalGrossRevenue - totalCommission;
  const totalPendingCount = courses.reduce((s, c) => s + c.pendingBookings, 0);
  const colSpanCount = showInstructor ? 9 : 8;

  function toggle(col: typeof sortKey) {
    if (sortKey === col) setSortDir((d) => d === "desc" ? "asc" : "desc");
    else { setSortKey(col); setSortDir("desc"); }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-xs text-gray-500">
          <tr>
            <th className="text-left px-4 py-3 font-medium">ชื่อคอร์ส</th>
            {showInstructor && <th className="text-left px-4 py-3 font-medium">ครู</th>}
            <th className="text-right px-3 py-3 font-medium">ราคา/คน</th>
            <th className="text-right px-3 py-3 font-medium cursor-pointer hover:text-violet-600 select-none" onClick={() => toggle("confirmedBookings")}>
              <span className="inline-flex items-center gap-1">นักเรียน <SortIcon active={sortKey === "confirmedBookings"} dir={sortDir} /></span>
            </th>
            <th className="text-right px-3 py-3 font-medium cursor-pointer hover:text-violet-600 select-none" onClick={() => toggle("revenue")}>
              <span className="inline-flex items-center gap-1">ราคา/รวม <SortIcon active={sortKey === "revenue"} dir={sortDir} /></span>
            </th>
            <th className="text-right px-3 py-3 font-medium text-red-500">ค่าคอมมิชชั่น</th>
            <th className="text-right px-4 py-3 font-medium text-green-600">รายได้รวม</th>
            <th className="text-right px-3 py-3 font-medium text-amber-600">รอชำระ</th>
            <th className="text-right px-3 py-3 font-medium text-blue-600">ชำระแล้ว</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {sorted.length === 0 ? (
            <tr><td colSpan={colSpanCount} className="text-center py-8 text-gray-400">ยังไม่มีข้อมูล</td></tr>
          ) : sorted.map((c) => {
            const courseNet = c.revenue - c.commissionAmount;
            return (
              <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3.5">
                  <p className="font-medium text-gray-800 line-clamp-1">{c.title}</p>
                </td>
                {showInstructor && <td className="px-4 py-3.5 text-gray-500 text-xs">{c.instructor}</td>}
                <td className="px-3 py-3.5 text-right text-gray-600">฿{fmt(c.price)}</td>
                <td className="px-3 py-3.5 text-right">
                  <span className="inline-flex items-center justify-center min-w-[28px] bg-violet-50 text-violet-700 text-xs font-semibold rounded-full px-2 py-0.5">{c.confirmedBookings}</span>
                </td>
                <td className="px-3 py-3.5 text-right text-gray-700">฿{fmt(c.revenue)}</td>
                <td className="px-3 py-3.5 text-right text-red-500">
                  {c.commissionRate > 0 ? `- ฿${fmt(c.commissionAmount)}` : <span className="text-gray-300">—</span>}
                </td>
                <td className="px-4 py-3.5 text-right font-semibold text-green-600">฿{fmt(courseNet)}</td>
                <td className="px-3 py-3.5 text-right">
                  <span className={`inline-flex items-center justify-center min-w-[28px] text-xs font-semibold rounded-full px-2 py-0.5 ${c.pendingBookings > 0 ? "bg-amber-50 text-amber-700" : "bg-gray-50 text-gray-400"}`}>
                    {c.pendingBookings}
                  </span>
                </td>
                <td className="px-3 py-3.5 text-right font-semibold text-blue-600">฿{fmt(c.revenue)}</td>
              </tr>
            );
          })}
        </tbody>
        {sorted.length > 0 && (
          <tfoot className="bg-gray-50 border-t border-gray-200 text-sm font-semibold">
            <tr>
              <td colSpan={showInstructor ? 4 : 3} className="px-4 py-3 text-gray-600">รวม</td>
              <td className="px-3 py-3 text-right text-gray-800">฿{fmt(totalGrossRevenue)}</td>
              <td className="px-3 py-3 text-right text-red-500">
                {totalCommission > 0 ? `- ฿${fmt(totalCommission)}` : "—"}
              </td>
              <td className="px-4 py-3 text-right text-green-600">฿{fmt(totalNet)}</td>
              <td className="px-3 py-3 text-right">
                <span className={`inline-flex items-center justify-center min-w-[28px] text-xs font-semibold rounded-full px-2 py-0.5 ${totalPendingCount > 0 ? "bg-amber-50 text-amber-700" : "bg-gray-50 text-gray-400"}`}>
                  {totalPendingCount}
                </span>
              </td>
              <td className="px-3 py-3 text-right text-blue-600">฿{fmt(totalGrossRevenue)}</td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}

function MonthlyChart({ monthly, filterMonth, setFilterMonth }: {
  monthly: MonthlyData[];
  filterMonth: string;
  setFilterMonth: (m: string) => void;
}) {
  const W = 600; const H = 120; const PAD = { t: 16, b: 28, l: 8, r: 8 };
  const max = Math.max(...monthly.map((m) => m.commission), 1);
  if (!monthly.length) return null;

  const n = monthly.length;
  const xOf = (i: number) => PAD.l + (i / Math.max(n - 1, 1)) * (W - PAD.l - PAD.r);
  const yOf = (v: number) => PAD.t + (1 - v / max) * (H - PAD.t - PAD.b);

  const points = monthly.map((m, i) => ({ x: xOf(i), y: yOf(m.commission), ...m }));
  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");
  const area = `M${points[0].x},${H - PAD.b} ` + points.map((p) => `L${p.x},${p.y}`).join(" ") + ` L${points[n - 1].x},${H - PAD.b} Z`;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <h2 className="text-sm font-semibold text-gray-800 mb-3">ค่าคอมมิชชั่นรายเดือน</h2>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 140 }}>
        <defs>
          <linearGradient id="commGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#commGrad)" />
        <polyline points={polyline} fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p) => {
          const isSel = filterMonth === p.month;
          return (
            <g key={p.month} onClick={() => setFilterMonth(filterMonth === p.month ? "all" : p.month)} className="cursor-pointer">
              <circle cx={p.x} cy={p.y} r={isSel ? 5 : 3.5} fill={isSel ? "#7c3aed" : "#fff"} stroke="#7c3aed" strokeWidth="2" />
              <text x={p.x} y={p.y - 9} textAnchor="middle" fontSize="9" fill={isSel ? "#7c3aed" : "#6b7280"} fontWeight={isSel ? "700" : "500"}>
                ฿{fmt(p.commission)}
              </text>
              <text x={p.x} y={H - PAD.b + 12} textAnchor="middle" fontSize="9" fill={isSel ? "#7c3aed" : "#9ca3af"} fontWeight={isSel ? "600" : "400"}>
                {monthLabel(p.month)}
              </text>
              <rect x={p.x - 16} y={0} width={32} height={H} fill="transparent" />
            </g>
          );
        })}
      </svg>
      {filterMonth !== "all" && (
        <p className="text-xs text-violet-500 -mt-1 text-center cursor-pointer" onClick={() => setFilterMonth("all")}>กดอีกครั้งเพื่อดูทุกเดือน</p>
      )}
    </div>
  );
}

function PayoutHistorySection({ payouts }: { payouts: PayoutRecord[] }) {
  const [slipUrl, setSlipUrl] = useState<string | null>(null);
  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">ประวัติการชำระเงินจาก Super Admin</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500">
              <tr>
                <th className="text-left px-4 py-3 font-medium">งวด</th>
                <th className="text-right px-3 py-3 font-medium">ยอดชำระ</th>
                <th className="text-center px-3 py-3 font-medium">สถานะ</th>
                <th className="text-left px-3 py-3 font-medium">วันที่ชำระ</th>
                <th className="text-center px-4 py-3 font-medium">สลิป</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {payouts.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3.5 text-gray-700">{p.periodLabel || "—"}</td>
                  <td className="px-3 py-3.5 text-right font-semibold text-green-600">฿{fmt(p.netPayout)}</td>
                  <td className="px-3 py-3.5 text-center">
                    {p.status === "paid"
                      ? <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">ชำระแล้ว</span>
                      : <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-medium">รอชำระ</span>}
                  </td>
                  <td className="px-3 py-3.5 text-gray-500 text-xs">
                    {p.paidAt ? new Date(p.paidAt).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    {p.slipUrl
                      ? <button onClick={() => setSlipUrl(p.slipUrl)} className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-violet-50 text-violet-600 hover:bg-violet-100 transition-colors">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      : <span className="text-gray-300 text-xs">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {slipUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setSlipUrl(null)}>
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-800">สลิปการโอนเงิน</p>
              <button onClick={() => setSlipUrl(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center bg-gray-50 min-h-[300px]">
              <img src={slipUrl} alt="slip" className="max-w-full max-h-[60vh] object-contain rounded-xl" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function SuperAdminRevenuePage() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [filterInstitution, setFilterInstitution] = useState("all");
  const [filterMonth, setFilterMonth] = useState("all");
  const [expandedTeachers, setExpandedTeachers] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const loadData = async (institutionId?: string) => {
    setLoading(true);
    const qs = institutionId && institutionId !== "all" ? `?institutionId=${institutionId}` : "";
    const [revRes, instRes] = await Promise.all([
      fetch(`/api/admin/revenue${qs}`),
      fetch("/api/admin/institutions"),
    ]);
    if (revRes.ok) setData(await revRes.json());
    if (instRes.ok) setInstitutions(await instRes.json());
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleInstitutionChange = (val: string) => {
    setFilterInstitution(val);
    setFilterMonth("all");
    loadData(val);
  };

  const teachers = data?.byTeacher ?? [];
  const allMonths = data?.monthly.map((m) => m.month) ?? [];

  const filteredTeachers = useMemo(() => {
    if (filterMonth === "all") return teachers;
    return teachers.map((t) => {
      const courses = t.courses.map((c) => {
        const count = c.byMonth[filterMonth] ?? 0;
        const filteredRevenue = count * c.price;
        const filteredCommission = Math.round(filteredRevenue * c.commissionRate / 100);
        return { ...c, confirmedBookings: count, revenue: filteredRevenue, commissionAmount: filteredCommission };
      });
      return {
        ...t,
        courses,
        totalRevenue: courses.reduce((s, c) => s + c.revenue, 0),
        totalConfirmed: courses.reduce((s, c) => s + c.confirmedBookings, 0),
      };
    });
  }, [teachers, filterMonth]);

  const commissionRate = data?.commissionRate ?? 0;
  const displayRevenue = filterMonth === "all" ? (data?.totalRevenue ?? 0) : filteredTeachers.reduce((s, t) => s + t.totalRevenue, 0);
  const displayConfirmed = filterMonth === "all" ? (data?.totalConfirmed ?? 0) : filteredTeachers.reduce((s, t) => s + t.totalConfirmed, 0);
  const displayCommission = filterMonth === "all"
    ? (data?.totalCommissionAmount ?? 0)
    : filteredTeachers.reduce((s, t) => s + t.courses.reduce((cs, c) => cs + c.commissionAmount, 0), 0);

  function toggleTeacher(key: string) {
    setExpandedTeachers((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400 text-sm">กำลังโหลด...</div>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">รายได้ — ทุกสถาบัน</h1>
          <p className="text-sm text-gray-500 mt-0.5">ภาพรวมรายได้ข้ามสถาบัน</p>
        </div>
        <div className="flex gap-3 flex-wrap">
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

          {allMonths.length > 0 && (
            <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-300">
              <option value="all">ทุกเดือน</option>
              {[...allMonths].reverse().map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
            </select>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 text-violet-500 mb-3"><TrendingUp className="w-4 h-4" /><span className="text-xs text-gray-500">ค่าคอมมิชชั่นรวม</span></div>
          <p className="text-2xl font-bold text-violet-600">฿{fmt(displayCommission)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-3"><Clock className="w-4 h-4 text-amber-500" /><span className="text-xs text-gray-500">รอชำระ</span></div>
          <p className={`text-2xl font-bold ${(data.outstanding ?? 0) > 0 ? "text-amber-500" : "text-gray-900"}`}>฿{fmt(data.outstanding ?? 0)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-3"><CheckCircle className="w-4 h-4 text-green-500" /><span className="text-xs text-gray-500">ชำระแล้ว</span></div>
          <p className="text-2xl font-bold text-green-600">฿{fmt(data.paidNetPayout ?? 0)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 text-green-500 mb-3"><Users className="w-4 h-4" /><span className="text-xs text-gray-500">นักเรียนทั้งหมด</span></div>
          <p className="text-2xl font-bold text-gray-900">{fmt(displayConfirmed)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 text-purple-500 mb-3"><BookOpen className="w-4 h-4" /><span className="text-xs text-gray-500">คอร์สทั้งหมด</span></div>
          <p className="text-2xl font-bold text-gray-900">{data.courseStats.length}</p>
        </div>
      </div>

      {commissionRate > 0 && (
        <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl border border-violet-100 p-5">
          <h2 className="text-sm font-semibold text-violet-800 mb-4">สรุป Commission ({commissionRate}%)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div><p className="text-xs text-gray-500 mb-1">รายได้รวม</p><p className="text-xl font-bold text-gray-800">฿{fmt(displayRevenue)}</p></div>
            <div><p className="text-xs text-gray-500 mb-1">Commission แพลตฟอร์ม ({commissionRate}%)</p><p className="text-xl font-bold text-red-500">- ฿{fmt(Math.round(displayRevenue * commissionRate / 100))}</p></div>
            <div><p className="text-xs text-gray-500 mb-1">รายได้สุทธิ</p><p className="text-xl font-bold text-green-600">฿{fmt(Math.round(displayRevenue * (1 - commissionRate / 100)))}</p></div>
          </div>
        </div>
      )}

      <MonthlyChart monthly={data.monthly} filterMonth={filterMonth} setFilterMonth={setFilterMonth} />

      {/* Teacher breakdown */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">รายได้แยกตามครู</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {filteredTeachers.map((t) => {
            const key = t.instructorId || t.instructor;
            const isOpen = expandedTeachers.has(key);
            const net = Math.round(t.totalRevenue * (1 - commissionRate / 100));
            return (
              <div key={key}>
                <button
                  onClick={() => toggleTeacher(key)}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-violet-600">{t.instructor.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm">{t.instructor}</p>
                    <p className="text-xs text-gray-400">{t.courses.length} คอร์ส · {t.totalConfirmed} นักเรียน</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-gray-800">฿{fmt(t.totalRevenue)}</p>
                    {commissionRate > 0 && <p className="text-xs text-green-600">สุทธิ ฿{fmt(net)}</p>}
                  </div>
                  {t.totalPending > 0 && (
                    <span className="shrink-0 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">รอ {t.totalPending}</span>
                  )}
                  <ChevronRight className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                </button>
                {isOpen && (
                  <div className="border-t border-gray-100 bg-gray-50">
                    <CourseTable courses={t.courses} />
                  </div>
                )}
              </div>
            );
          })}
          {filteredTeachers.length === 0 && (
            <div className="py-10 text-center text-gray-400 text-sm">ยังไม่มีข้อมูล</div>
          )}
        </div>
      </div>

      {(data.payoutHistory ?? []).length > 0 && (
        <PayoutHistorySection payouts={data.payoutHistory} />
      )}
    </div>
  );
}
