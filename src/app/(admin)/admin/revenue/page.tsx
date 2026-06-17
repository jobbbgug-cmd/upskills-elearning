"use client";
import { useEffect, useState, useMemo } from "react";
import { TrendingUp, Users, Clock, BookOpen, ChevronUp, ChevronDown, Minus, ChevronRight } from "lucide-react";

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

interface MonthlyData { month: string; revenue: number; }

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
}

const fmt = (n: number) => n.toLocaleString("th-TH");

const MONTHS_TH = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
function monthLabel(m: string) {
  const [y, mo] = m.split("-");
  return `${MONTHS_TH[Number(mo) - 1]} ${String(Number(y) + 543).slice(2)}`;
}

function SortIcon({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
  if (!active) return <Minus className="w-3 h-3 text-gray-300" />;
  return dir === "desc" ? <ChevronDown className="w-3 h-3 text-indigo-500" /> : <ChevronUp className="w-3 h-3 text-indigo-500" />;
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
  const colSpanCount = showInstructor ? 8 : 7;

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
            <th className="text-right px-3 py-3 font-medium cursor-pointer hover:text-indigo-600 select-none" onClick={() => toggle("confirmedBookings")}>
              <span className="inline-flex items-center gap-1">นักเรียน <SortIcon active={sortKey === "confirmedBookings"} dir={sortDir} /></span>
            </th>
            <th className="text-right px-3 py-3 font-medium cursor-pointer hover:text-indigo-600 select-none" onClick={() => toggle("revenue")}>
              <span className="inline-flex items-center gap-1">ราคา/รวม <SortIcon active={sortKey === "revenue"} dir={sortDir} /></span>
            </th>
            <th className="text-right px-3 py-3 font-medium text-amber-600">รอชำระ</th>
            <th className="text-right px-3 py-3 font-medium text-red-500">ค่าคอมมิชชั่น</th>
            <th className="text-right px-4 py-3 font-medium text-green-600">รายได้รวม</th>
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
                  <span className="inline-flex items-center justify-center min-w-[28px] bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full px-2 py-0.5">{c.confirmedBookings}</span>
                </td>
                <td className="px-3 py-3.5 text-right text-gray-700">฿{fmt(c.revenue)}</td>
                <td className="px-3 py-3.5 text-right">
                  {c.pendingBookings > 0
                    ? <span className="inline-flex items-center justify-center min-w-[28px] bg-amber-50 text-amber-700 text-xs font-semibold rounded-full px-2 py-0.5">{c.pendingBookings}</span>
                    : <span className="text-gray-300">—</span>}
                </td>
                <td className="px-3 py-3.5 text-right text-red-500">
                  {c.commissionRate > 0 ? `- ฿${fmt(c.commissionAmount)}` : <span className="text-gray-300">—</span>}
                </td>
                <td className="px-4 py-3.5 text-right font-semibold text-green-600">฿{fmt(courseNet)}</td>
              </tr>
            );
          })}
        </tbody>
        {sorted.length > 0 && (
          <tfoot className="bg-gray-50 border-t border-gray-200 text-sm font-semibold">
            <tr>
              <td colSpan={showInstructor ? 4 : 3} className="px-4 py-3 text-gray-600">รวม</td>
              <td className="px-3 py-3 text-right text-gray-800">฿{fmt(totalGrossRevenue)}</td>
              <td className="px-3 py-3" />
              <td className="px-3 py-3 text-right text-red-500">
                {totalCommission > 0 ? `- ฿${fmt(totalCommission)}` : "—"}
              </td>
              <td className="px-4 py-3 text-right text-green-600">฿{fmt(totalNet)}</td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}

function MonthlyChart({ monthly, filterMonth, setFilterMonth, commissionRate }: {
  monthly: MonthlyData[];
  filterMonth: string;
  setFilterMonth: (m: string) => void;
  commissionRate: number;
}) {
  const netMonthly = monthly.map((m) => ({ ...m, revenue: Math.round(m.revenue * (1 - commissionRate / 100)) }));
  const max = Math.max(...netMonthly.map((m) => m.revenue), 1);
  if (!netMonthly.length) return null;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <h2 className="text-sm font-semibold text-gray-800 mb-4">รายได้รายเดือน{commissionRate > 0 ? " (สุทธิหลังหักค่าคอม)" : ""}</h2>
      <div className="flex items-end gap-2 h-32">
        {netMonthly.map((m) => {
          const pct = (m.revenue / max) * 100;
          const isSel = filterMonth === m.month;
          return (
            <button key={m.month} onClick={() => setFilterMonth(filterMonth === m.month ? "all" : m.month)}
              className="flex-1 flex flex-col items-center gap-1 group" title={`${monthLabel(m.month)}: ฿${fmt(m.revenue)}`}>
              <span className="text-[10px] text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">฿{fmt(m.revenue)}</span>
              <div className="w-full rounded-t-md transition-colors" style={{ height: `${Math.max(pct, 4)}%`, backgroundColor: isSel ? "#6366f1" : "#c7d2fe" }} />
              <span className={`text-[10px] ${isSel ? "text-indigo-600 font-semibold" : "text-gray-400"}`}>{monthLabel(m.month)}</span>
            </button>
          );
        })}
      </div>
      {filterMonth !== "all" && (
        <p className="text-xs text-indigo-500 mt-2 text-center cursor-pointer" onClick={() => setFilterMonth("all")}>กดอีกครั้งเพื่อดูทุกเดือน</p>
      )}
    </div>
  );
}

/* ── Teacher view ── */
function TeacherView({ data }: { data: RevenueData }) {
  const [filterMonth, setFilterMonth] = useState("all");
  const [sortKey, setSortKey] = useState<"revenue" | "confirmedBookings">("revenue");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");

  const allMonths = data.monthly.map((m) => m.month);

  const filteredStats = useMemo(() => {
    return data.courseStats
      .map((c) => {
        if (filterMonth === "all") return c;
        const count = c.byMonth[filterMonth] ?? 0;
        return { ...c, confirmedBookings: count, revenue: count * c.price };
      })
      .sort((a, b) => {
        const d = a[sortKey] - b[sortKey];
        return sortDir === "desc" ? -d : d;
      });
  }, [data.courseStats, filterMonth, sortKey, sortDir]);

  const grossRevenue = filteredStats.reduce((s, c) => s + c.revenue, 0);
  const commissionDeducted = Math.round(grossRevenue * data.commissionRate / 100);
  const netRevenue = grossRevenue - commissionDeducted;
  const displayConfirmed = filteredStats.reduce((s, c) => s + c.confirmedBookings, 0);
  const netPending = Math.round(data.totalPending * (1 - data.commissionRate / 100));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">รายได้ของฉัน</h1>
          <p className="text-sm text-gray-500 mt-0.5">รายได้จากคอร์สที่สอน</p>
        </div>
        {allMonths.length > 0 && (
          <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300">
            <option value="all">ทุกเดือน</option>
            {[...allMonths].reverse().map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
          </select>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-3"><TrendingUp className="w-4 h-4 text-green-500" /><span className="text-xs text-gray-500">รายได้รวม</span></div>
          <p className="text-2xl font-bold text-green-600">฿{fmt(netRevenue)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-3"><Clock className="w-4 h-4 text-amber-500" /><span className="text-xs text-gray-500">รอชำระ</span></div>
          <p className="text-2xl font-bold text-gray-900">฿{fmt(netPending)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-3"><Users className="w-4 h-4 text-indigo-500" /><span className="text-xs text-gray-500">นักเรียนทั้งหมด</span></div>
          <p className="text-2xl font-bold text-gray-900">{fmt(displayConfirmed)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-3"><BookOpen className="w-4 h-4 text-purple-500" /><span className="text-xs text-gray-500">คอร์สทั้งหมด</span></div>
          <p className="text-2xl font-bold text-gray-900">{data.courseStats.length}</p>
        </div>
      </div>

      <MonthlyChart monthly={data.monthly} filterMonth={filterMonth} setFilterMonth={setFilterMonth} commissionRate={data.commissionRate} />

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">รายได้แยกตามคอร์ส</h2>
        </div>
        <CourseTable courses={filteredStats} />
      </div>
    </div>
  );
}

/* ── Admin view ── */
function AdminView({ data }: { data: RevenueData }) {
  const [filterMonth, setFilterMonth] = useState("all");
  const [expandedTeachers, setExpandedTeachers] = useState<Set<string>>(new Set());
  const allMonths = data.monthly.map((m) => m.month);

  const teachers = data.byTeacher ?? [];

  const filteredTeachers = useMemo(() => {
    if (filterMonth === "all") return teachers;
    return teachers.map((t) => {
      const courses = t.courses.map((c) => {
        const count = c.byMonth[filterMonth] ?? 0;
        return { ...c, confirmedBookings: count, revenue: count * c.price };
      });
      return {
        ...t,
        courses,
        totalRevenue: courses.reduce((s, c) => s + c.revenue, 0),
        totalConfirmed: courses.reduce((s, c) => s + c.confirmedBookings, 0),
      };
    });
  }, [teachers, filterMonth]);

  const grossRevenue = filterMonth === "all"
    ? data.totalRevenue
    : filteredTeachers.reduce((s, t) => s + t.totalRevenue, 0);
  const commissionDeducted = Math.round(grossRevenue * data.commissionRate / 100);
  const netRevenue = grossRevenue - commissionDeducted;
  const netPending = Math.round(data.totalPending * (1 - data.commissionRate / 100));
  const displayConfirmed = filterMonth === "all" ? data.totalConfirmed : filteredTeachers.reduce((s, t) => s + t.totalConfirmed, 0);

  function toggleTeacher(key: string) {
    setExpandedTeachers((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">รายได้</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            ภาพรวมรายได้ทั้งหมด{data.commissionRate > 0 ? ` (สุทธิหลังหักค่าคอม ${data.commissionRate}%)` : ""}
          </p>
        </div>
        {allMonths.length > 0 && (
          <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300">
            <option value="all">ทุกเดือน</option>
            {[...allMonths].reverse().map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
          </select>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 text-green-500 mb-3"><TrendingUp className="w-4 h-4" /><span className="text-xs text-gray-500">รายได้รวม</span></div>
          <p className="text-2xl font-bold text-green-600">฿{fmt(netRevenue)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 text-amber-500 mb-3"><Clock className="w-4 h-4" /><span className="text-xs text-gray-500">รอชำระ</span></div>
          <p className="text-2xl font-bold text-gray-900">฿{fmt(netPending)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 text-indigo-500 mb-3"><Users className="w-4 h-4" /><span className="text-xs text-gray-500">นักเรียนทั้งหมด</span></div>
          <p className="text-2xl font-bold text-gray-900">{fmt(displayConfirmed)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 text-purple-500 mb-3"><BookOpen className="w-4 h-4" /><span className="text-xs text-gray-500">คอร์สทั้งหมด</span></div>
          <p className="text-2xl font-bold text-gray-900">{data.courseStats.length}</p>
        </div>
      </div>

      <MonthlyChart monthly={data.monthly} filterMonth={filterMonth} setFilterMonth={setFilterMonth} commissionRate={data.commissionRate} />

      {/* Teacher breakdown */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">รายได้แยกตามครู</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {filteredTeachers.map((t) => {
            const key = t.instructorId || t.instructor;
            const isOpen = expandedTeachers.has(key);
            const teacherNet = Math.round(t.totalRevenue * (1 - data.commissionRate / 100));
            return (
              <div key={key}>
                <button
                  onClick={() => toggleTeacher(key)}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-indigo-600">{t.instructor.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm">{t.instructor}</p>
                    <p className="text-xs text-gray-400">{t.courses.length} คอร์ส · {t.totalConfirmed} นักเรียน</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-gray-800">฿{fmt(teacherNet)}</p>
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
    </div>
  );
}

/* ── Main ── */
export default function RevenuePage() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/revenue")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); });
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400 text-sm">กำลังโหลด...</div>;
  if (!data) return null;

  return data.role === "admin" ? <AdminView data={data} /> : <TeacherView data={data} />;
}
