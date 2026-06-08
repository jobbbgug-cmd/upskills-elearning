"use client";
import { useEffect, useState } from "react";
import { TrendingUp, Users, Clock, BookOpen, ChevronUp, ChevronDown, Minus } from "lucide-react";

interface CourseStat {
  _id: string;
  title: string;
  instructor: string;
  price: number;
  confirmedBookings: number;
  pendingBookings: number;
  revenue: number;
  pendingRevenue: number;
  byMonth: Record<string, number>;
}

interface MonthlyData {
  month: string;
  revenue: number;
}

interface RevenueData {
  courseStats: CourseStat[];
  monthly: MonthlyData[];
  totalRevenue: number;
  totalPending: number;
  totalConfirmed: number;
}

const COMMISSION_RATE = 0.2; // 20%

function fmt(n: number) {
  return n.toLocaleString("th-TH");
}

function monthLabel(m: string) {
  const [y, mo] = m.split("-");
  const d = new Date(Number(y), Number(mo) - 1, 1);
  return d.toLocaleDateString("th-TH", { month: "short", year: "2-digit" });
}

export default function RevenuePage() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<"revenue" | "confirmedBookings">("revenue");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");
  const [filterMonth, setFilterMonth] = useState<string>("all");

  useEffect(() => {
    fetch("/api/admin/revenue")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        กำลังโหลด...
      </div>
    );
  }
  if (!data) return null;

  const allMonths = data.monthly.map((m) => m.month);

  // Filter course stats by month
  const filteredStats = data.courseStats
    .map((c) => {
      if (filterMonth === "all") return c;
      const count = c.byMonth[filterMonth] ?? 0;
      return { ...c, confirmedBookings: count, revenue: count * c.price };
    })
    .sort((a, b) => {
      const diff = a[sortKey] - b[sortKey];
      return sortDir === "desc" ? -diff : diff;
    });

  const displayRevenue = filterMonth === "all"
    ? data.totalRevenue
    : filteredStats.reduce((s, c) => s + c.revenue, 0);

  const displayConfirmed = filterMonth === "all"
    ? data.totalConfirmed
    : filteredStats.reduce((s, c) => s + c.confirmedBookings, 0);

  const commission = displayRevenue * COMMISSION_RATE;
  const netRevenue = displayRevenue - commission;

  // Bar chart max
  const maxMonthlyRevenue = Math.max(...data.monthly.map((m) => m.revenue), 1);

  function SortIcon({ col }: { col: typeof sortKey }) {
    if (sortKey !== col) return <Minus className="w-3 h-3 text-gray-300" />;
    return sortDir === "desc"
      ? <ChevronDown className="w-3 h-3 text-indigo-500" />
      : <ChevronUp className="w-3 h-3 text-indigo-500" />;
  }

  function toggleSort(col: typeof sortKey) {
    if (sortKey === col) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else { setSortKey(col); setSortDir("desc"); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">รายได้</h1>
          <p className="text-sm text-gray-500 mt-0.5">ภาพรวมรายได้จากคอร์สทั้งหมด</p>
        </div>
        {allMonths.length > 0 && (
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            <option value="all">ทุกเดือน</option>
            {[...allMonths].reverse().map((m) => (
              <option key={m} value={m}>{monthLabel(m)}</option>
            ))}
          </select>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 text-indigo-500 mb-3">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-medium text-gray-500">รายได้รวม</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">฿{fmt(displayRevenue)}</p>
          <p className="text-xs text-gray-400 mt-1">จากการจองที่ยืนยันแล้ว</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 text-amber-500 mb-3">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-medium text-gray-500">รอชำระ</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">฿{fmt(data.totalPending)}</p>
          <p className="text-xs text-gray-400 mt-1">ยังไม่ยืนยัน</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 text-green-500 mb-3">
            <Users className="w-4 h-4" />
            <span className="text-xs font-medium text-gray-500">นักเรียนทั้งหมด</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{fmt(displayConfirmed)}</p>
          <p className="text-xs text-gray-400 mt-1">การจองที่ยืนยันแล้ว</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 text-purple-500 mb-3">
            <BookOpen className="w-4 h-4" />
            <span className="text-xs font-medium text-gray-500">คอร์สทั้งหมด</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{data.courseStats.length}</p>
          <p className="text-xs text-gray-400 mt-1">คอร์สที่เปิดสอน</p>
        </div>
      </div>

      {/* Commission breakdown */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-5">
        <h2 className="text-sm font-semibold text-indigo-800 mb-4">สรุปรายได้หลังหัก Commission ({(COMMISSION_RATE * 100).toFixed(0)}%)</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">รายได้รวม</p>
            <p className="text-xl font-bold text-gray-800">฿{fmt(displayRevenue)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Commission แพลตฟอร์ม (20%)</p>
            <p className="text-xl font-bold text-red-500">- ฿{fmt(commission)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">ยอดที่ครูได้รับ (80%)</p>
            <p className="text-xl font-bold text-green-600">฿{fmt(netRevenue)}</p>
          </div>
        </div>
      </div>

      {/* Monthly bar chart */}
      {data.monthly.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">รายได้รายเดือน</h2>
          <div className="flex items-end gap-2 h-32">
            {data.monthly.map((m) => {
              const pct = (m.revenue / maxMonthlyRevenue) * 100;
              const isSelected = filterMonth === m.month;
              return (
                <button
                  key={m.month}
                  onClick={() => setFilterMonth(filterMonth === m.month ? "all" : m.month)}
                  className="flex-1 flex flex-col items-center gap-1 group"
                  title={`${monthLabel(m.month)}: ฿${fmt(m.revenue)}`}
                >
                  <span className="text-[10px] text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    ฿{fmt(m.revenue)}
                  </span>
                  <div className="w-full rounded-t-md transition-colors" style={{
                    height: `${Math.max(pct, 4)}%`,
                    backgroundColor: isSelected ? "#6366f1" : "#c7d2fe",
                  }} />
                  <span className={`text-[10px] ${isSelected ? "text-indigo-600 font-semibold" : "text-gray-400"}`}>
                    {monthLabel(m.month)}
                  </span>
                </button>
              );
            })}
          </div>
          {filterMonth !== "all" && (
            <p className="text-xs text-indigo-500 mt-2 text-center">
              กดที่แท่งอีกครั้งเพื่อดูทุกเดือน
            </p>
          )}
        </div>
      )}

      {/* Course table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">รายได้แยกตามคอร์ส</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500">
              <tr>
                <th className="text-left px-5 py-3 font-medium">ชื่อคอร์ส</th>
                <th className="text-right px-4 py-3 font-medium">ราคา/คน</th>
                <th
                  className="text-right px-4 py-3 font-medium cursor-pointer select-none hover:text-indigo-600"
                  onClick={() => toggleSort("confirmedBookings")}
                >
                  <span className="inline-flex items-center gap-1">
                    นักเรียน <SortIcon col="confirmedBookings" />
                  </span>
                </th>
                <th className="text-right px-4 py-3 font-medium text-amber-600">รอชำระ</th>
                <th
                  className="text-right px-5 py-3 font-medium cursor-pointer select-none hover:text-indigo-600"
                  onClick={() => toggleSort("revenue")}
                >
                  <span className="inline-flex items-center gap-1">
                    รายได้รวม <SortIcon col="revenue" />
                  </span>
                </th>
                <th className="text-right px-5 py-3 font-medium text-green-600">ครูได้รับ (80%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredStats.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-400">ยังไม่มีข้อมูล</td>
                </tr>
              ) : (
                filteredStats.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-gray-800 line-clamp-1">{c.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{c.instructor}</p>
                    </td>
                    <td className="px-4 py-3.5 text-right text-gray-600">฿{fmt(c.price)}</td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="inline-flex items-center justify-center min-w-[28px] bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full px-2 py-0.5">
                        {c.confirmedBookings}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {c.pendingBookings > 0 ? (
                        <span className="inline-flex items-center justify-center min-w-[28px] bg-amber-50 text-amber-700 text-xs font-semibold rounded-full px-2 py-0.5">
                          {c.pendingBookings}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold text-gray-800">
                      ฿{fmt(c.revenue)}
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold text-green-600">
                      ฿{fmt(Math.round(c.revenue * (1 - COMMISSION_RATE)))}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {filteredStats.length > 0 && (
              <tfoot className="bg-gray-50 border-t border-gray-200 text-sm font-semibold">
                <tr>
                  <td colSpan={4} className="px-5 py-3 text-gray-600">รวมทั้งหมด</td>
                  <td className="px-5 py-3 text-right text-gray-800">฿{fmt(displayRevenue)}</td>
                  <td className="px-5 py-3 text-right text-green-600">฿{fmt(Math.round(netRevenue))}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
