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
  pendingRevenue: number;
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
  totalPending: number;
  totalConfirmed: number;
  byTeacher: TeacherGroup[] | null;
}

const COMMISSION = 0.2;
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

function CourseTable({ courses, showInstructor = false }: { courses: CourseStat[]; showInstructor?: boolean }) {
  const [sortKey, setSortKey] = useState<"revenue" | "confirmedBookings">("revenue");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");
  const sorted = [...courses].sort((a, b) => {
    const d = a[sortKey] - b[sortKey];
    return sortDir === "desc" ? -d : d;
  });
  const totalRevenue = courses.reduce((s, c) => s + c.revenue, 0);
  const totalNet = Math.round(totalRevenue * (1 - COMMISSION));

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
            <th className="text-right px-3 py-3 font-medium text-amber-600">รอชำระ</th>
            <th className="text-right px-4 py-3 font-medium cursor-pointer hover:text-indigo-600 select-none" onClick={() => toggle("revenue")}>
              <span className="inline-flex items-center gap-1">รายได้รวม <SortIcon active={sortKey === "revenue"} dir={sortDir} /></span>
            </th>
            <th className="text-right px-4 py-3 font-medium text-green-600">ครูได้รับ (80%)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {sorted.length === 0 ? (
            <tr><td colSpan={showInstructor ? 7 : 6} className="text-center py-8 text-gray-400">ยังไม่มีข้อมูล</td></tr>
          ) : sorted.map((c) => (
            <tr key={c._id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3.5">
                <p className="font-medium text-gray-800 line-clamp-1">{c.title}</p>
              </td>
              {showInstructor && <td className="px-4 py-3.5 text-gray-500 text-xs">{c.instructor}</td>}
              <td className="px-3 py-3.5 text-right text-gray-600">฿{fmt(c.price)}</td>
              <td className="px-3 py-3.5 text-right">
                <span className="inline-flex items-center justify-center min-w-[28px] bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full px-2 py-0.5">{c.confirmedBookings}</span>
              </td>
              <td className="px-3 py-3.5 text-right">
                {c.pendingBookings > 0
                  ? <span className="inline-flex items-center justify-center min-w-[28px] bg-amber-50 text-amber-700 text-xs font-semibold rounded-full px-2 py-0.5">{c.pendingBookings}</span>
                  : <span className="text-gray-300">—</span>}
              </td>
              <td className="px-4 py-3.5 text-right font-semibold text-gray-800">฿{fmt(c.revenue)}</td>
              <td className="px-4 py-3.5 text-right font-semibold text-green-600">฿{fmt(Math.round(c.revenue * (1 - COMMISSION)))}</td>
            </tr>
          ))}
        </tbody>
        {sorted.length > 0 && (
          <tfoot className="bg-gray-50 border-t border-gray-200 text-sm font-semibold">
            <tr>
              <td colSpan={showInstructor ? 5 : 4} className="px-4 py-3 text-gray-600">รวม</td>
              <td className="px-4 py-3 text-right text-gray-800">฿{fmt(totalRevenue)}</td>
              <td className="px-4 py-3 text-right text-green-600">฿{fmt(totalNet)}</td>
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
  const max = Math.max(...monthly.map((m) => m.revenue), 1);
  if (!monthly.length) return null;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <h2 className="text-sm font-semibold text-gray-800 mb-4">รายได้รายเดือน</h2>
      <div className="flex items-end gap-2 h-32">
        {monthly.map((m) => {
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

/* ── Teacher view (role=teacher) ── */
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

  const displayRevenue = filteredStats.reduce((s, c) => s + c.revenue, 0);
  const netRevenue = Math.round(displayRevenue * (1 - COMMISSION));
  const displayConfirmed = filteredStats.reduce((s, c) => s + c.confirmedBookings, 0);

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

      {/* Summary — teacher only sees revenue + net */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-3"><TrendingUp className="w-4 h-4 text-indigo-500" /><span className="text-xs text-gray-500">รายได้รวม</span></div>
          <p className="text-2xl font-bold text-gray-900">฿{fmt(displayRevenue)}</p>
          <p className="text-xs text-gray-400 mt-1">จากการจองที่ยืนยันแล้ว</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-5">
          <div className="flex items-center gap-2 mb-3"><TrendingUp className="w-4 h-4 text-green-500" /><span className="text-xs text-gray-500">ยอดที่ครูได้รับ (80%)</span></div>
          <p className="text-2xl font-bold text-green-600">฿{fmt(netRevenue)}</p>
          <p className="text-xs text-gray-400 mt-1">หลังหัก commission แพลตฟอร์ม</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-3"><Clock className="w-4 h-4 text-amber-500" /><span className="text-xs text-gray-500">รอชำระ</span></div>
          <p className="text-2xl font-bold text-gray-900">฿{fmt(data.totalPending)}</p>
          <p className="text-xs text-gray-400 mt-1">ยังไม่ยืนยัน</p>
        </div>
      </div>

      <MonthlyChart monthly={data.monthly} filterMonth={filterMonth} setFilterMonth={setFilterMonth} />

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">รายได้แยกตามคอร์ส</h2>
        </div>
        <CourseTable courses={filteredStats} />
      </div>
    </div>
  );
}

/* ── Admin view (role=admin) ── */
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

  const displayRevenue = filterMonth === "all" ? data.totalRevenue : filteredTeachers.reduce((s, t) => s + t.totalRevenue, 0);
  const displayConfirmed = filterMonth === "all" ? data.totalConfirmed : filteredTeachers.reduce((s, t) => s + t.totalConfirmed, 0);
  const commission = displayRevenue * COMMISSION;
  const netRevenue = displayRevenue - commission;

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
          <p className="text-sm text-gray-500 mt-0.5">ภาพรวมรายได้ทั้งหมด</p>
        </div>
        {allMonths.length > 0 && (
          <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300">
            <option value="all">ทุกเดือน</option>
            {[...allMonths].reverse().map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
          </select>
        )}
      </div>

      {/* Admin summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 text-indigo-500 mb-3"><TrendingUp className="w-4 h-4" /><span className="text-xs text-gray-500">รายได้รวม</span></div>
          <p className="text-2xl font-bold text-gray-900">฿{fmt(displayRevenue)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 text-amber-500 mb-3"><Clock className="w-4 h-4" /><span className="text-xs text-gray-500">รอชำระ</span></div>
          <p className="text-2xl font-bold text-gray-900">฿{fmt(data.totalPending)}</p>
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

      {/* Commission breakdown */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-5">
        <h2 className="text-sm font-semibold text-indigo-800 mb-4">สรุป Commission (20%)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div><p className="text-xs text-gray-500 mb-1">รายได้รวม</p><p className="text-xl font-bold text-gray-800">฿{fmt(displayRevenue)}</p></div>
          <div><p className="text-xs text-gray-500 mb-1">Commission แพลตฟอร์ม (20%)</p><p className="text-xl font-bold text-red-500">- ฿{fmt(commission)}</p></div>
          <div><p className="text-xs text-gray-500 mb-1">จ่ายให้ครูทั้งหมด (80%)</p><p className="text-xl font-bold text-green-600">฿{fmt(Math.round(netRevenue))}</p></div>
        </div>
      </div>

      <MonthlyChart monthly={data.monthly} filterMonth={filterMonth} setFilterMonth={setFilterMonth} />

      {/* Teacher breakdown — expand/collapse */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">รายได้แยกตามครู</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {filteredTeachers.map((t) => {
            const key = t.instructorId || t.instructor;
            const isOpen = expandedTeachers.has(key);
            const net = Math.round(t.totalRevenue * (1 - COMMISSION));
            return (
              <div key={key}>
                {/* Teacher row */}
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
                    <p className="text-sm font-bold text-gray-800">฿{fmt(t.totalRevenue)}</p>
                    <p className="text-xs text-green-600">ครูได้ ฿{fmt(net)}</p>
                  </div>
                  {t.totalPending > 0 && (
                    <span className="shrink-0 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">รอ {t.totalPending}</span>
                  )}
                  <ChevronRight className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                </button>

                {/* Expanded courses */}
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
