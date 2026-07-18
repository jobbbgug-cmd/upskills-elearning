"use client";
import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Area, AreaChart,
} from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MonthlyRevenue { month: string; revenue: number; bookings: number; }
interface MonthlyStudents { month: string; count: number; }
interface TopCourse { title: string; count: number; }
interface DashboardData { monthlyRevenue: MonthlyRevenue[]; monthlyStudents: MonthlyStudents[]; topCourses: TopCourse[]; }

function TrendBadge({ current, previous }: { current: number; previous: number }) {
  if (previous === 0 && current === 0) return <span className="text-xs text-gray-400">ไม่มีข้อมูล</span>;
  if (previous === 0) return <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600"><TrendingUp className="w-3.5 h-3.5" />ใหม่</span>;
  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct > 0) return <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600"><TrendingUp className="w-3.5 h-3.5" />+{pct}%</span>;
  if (pct < 0) return <span className="flex items-center gap-1 text-xs font-semibold text-rose-500"><TrendingDown className="w-3.5 h-3.5" />{pct}%</span>;
  return <span className="flex items-center gap-1 text-xs font-semibold text-gray-400"><Minus className="w-3.5 h-3.5" />0%</span>;
}

function formatB(val: number) {
  if (val >= 1000000) return `฿${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `฿${(val / 1000).toFixed(0)}K`;
  return `฿${val.toLocaleString()}`;
}

const CustomRevTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      <p className="text-indigo-600">รายได้: ฿{payload[0]?.value?.toLocaleString()}</p>
      {payload[1] && <p className="text-violet-500">การจอง: {payload[1].value} ครั้ง</p>}
    </div>
  );
};

const CustomStudentTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      <p className="text-teal-600">นักเรียนใหม่: {payload[0]?.value} คน</p>
    </div>
  );
};

export default function DashboardCharts({ branchId }: { branchId: string }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = branchId ? `/api/owner/dashboard?branchId=${branchId}` : "/api/owner/dashboard";
    fetch(url).then((r) => r.json()).then((d) => { setData(d); setLoading(false); });
  }, [branchId]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 h-64 animate-pulse" />
        ))}
      </div>
    );
  }
  if (!data) return null;

  const { monthlyRevenue, monthlyStudents, topCourses } = data;

  const maxCourse = topCourses[0]?.count ?? 1;
  const lastRev = monthlyRevenue[monthlyRevenue.length - 1]?.revenue ?? 0;
  const prevRev = monthlyRevenue[monthlyRevenue.length - 2]?.revenue ?? 0;
  const lastStudents = monthlyStudents[monthlyStudents.length - 1]?.count ?? 0;
  const prevStudents = monthlyStudents[monthlyStudents.length - 2]?.count ?? 0;
  const totalRevenue = monthlyRevenue.reduce((s, m) => s + m.revenue, 0);
  const totalBookings = monthlyRevenue.reduce((s, m) => s + m.bookings, 0);

  return (
    <div className="space-y-5">
      {/* Chart row: Bar + Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Monthly Revenue Bar Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">รายได้รายเดือน</h3>
              <p className="text-xs text-gray-400 mt-0.5">6 เดือนล่าสุด</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-indigo-600">{formatB(totalRevenue)}</p>
              <TrendBadge current={lastRev} previous={prevRev} />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyRevenue} barGap={4} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => formatB(v)} tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={48} />
              <Tooltip content={<CustomRevTooltip />} cursor={{ fill: "#f5f3ff", radius: 4 }} />
              <Bar dataKey="revenue" name="รายได้" fill="url(#revenueGrad)" radius={[6, 6, 0, 0]} maxBarSize={40} />
              <Bar dataKey="bookings" name="การจอง" fill="#ddd6fe" radius={[6, 6, 0, 0]} maxBarSize={40} />
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2">
            <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-3 h-3 rounded-sm bg-indigo-500 inline-block" />รายได้</span>
            <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-3 h-3 rounded-sm bg-violet-200 inline-block" />การจอง</span>
          </div>
        </div>

        {/* Student Growth Area Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">นักเรียนใหม่</h3>
              <p className="text-xs text-gray-400 mt-0.5">6 เดือนล่าสุด</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-teal-600">{lastStudents} คน</p>
              <TrendBadge current={lastStudents} previous={prevStudents} />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthlyStudents}>
              <defs>
                <linearGradient id="studentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={28} allowDecimals={false} />
              <Tooltip content={<CustomStudentTooltip />} cursor={{ stroke: "#14b8a6", strokeWidth: 1, strokeDasharray: "4 4" }} />
              <Area type="monotone" dataKey="count" stroke="#14b8a6" strokeWidth={2.5} fill="url(#studentGrad)" dot={{ fill: "#14b8a6", strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row: Top courses + Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top Courses ranking */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">คอร์สยอดนิยม</h3>
              <p className="text-xs text-gray-400 mt-0.5">เรียงตามจำนวนการจองที่ยืนยัน</p>
            </div>
          </div>
          {topCourses.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">ยังไม่มีข้อมูลการจอง</p>
          ) : (
            <div className="space-y-4">
              {topCourses.map((c, i) => {
                const pct = maxCourse > 0 ? Math.round((c.count / maxCourse) * 100) : 0;
                const colors = [
                  { bar: "bg-gradient-to-r from-indigo-500 to-violet-500", badge: "bg-indigo-50 text-indigo-700" },
                  { bar: "bg-gradient-to-r from-violet-500 to-purple-500", badge: "bg-violet-50 text-violet-700" },
                  { bar: "bg-gradient-to-r from-teal-500 to-emerald-500", badge: "bg-teal-50 text-teal-700" },
                  { bar: "bg-gradient-to-r from-amber-400 to-orange-500", badge: "bg-amber-50 text-amber-700" },
                  { bar: "bg-gradient-to-r from-rose-400 to-pink-500", badge: "bg-rose-50 text-rose-700" },
                  { bar: "bg-gradient-to-r from-blue-400 to-sky-500", badge: "bg-blue-50 text-blue-700" },
                ];
                const col = colors[i % colors.length];
                return (
                  <div key={c.title}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-bold text-gray-400 w-4 shrink-0">#{i + 1}</span>
                        <span className="text-sm font-medium text-gray-800 truncate">{c.title}</span>
                      </div>
                      <span className={`shrink-0 ml-2 text-xs font-bold px-2.5 py-0.5 rounded-full ${col.badge}`}>{c.count} จอง</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${col.bar} transition-all duration-700`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Booking Revenue Line Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">แนวโน้มการจอง</h3>
              <p className="text-xs text-gray-400 mt-0.5">6 เดือนล่าสุด</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-violet-600">{totalBookings} ครั้ง</p>
              <p className="text-xs text-gray-400">รวมทั้งหมด</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={28} allowDecimals={false} />
              <Tooltip content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-lg text-xs">
                    <p className="font-semibold text-gray-700 mb-1">{label}</p>
                    <p className="text-violet-600">การจอง: {payload[0]?.value} ครั้ง</p>
                  </div>
                );
              }} cursor={{ stroke: "#8b5cf6", strokeWidth: 1, strokeDasharray: "4 4" }} />
              <Line type="monotone" dataKey="bookings" stroke="#8b5cf6" strokeWidth={2.5} dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
          {/* Mini stats */}
          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <p className="text-xl font-bold text-indigo-600">{formatB(lastRev)}</p>
              <p className="text-xs text-gray-400 mt-0.5">รายได้เดือนนี้</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-teal-600">{lastStudents}</p>
              <p className="text-xs text-gray-400 mt-0.5">นักเรียนใหม่เดือนนี้</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
