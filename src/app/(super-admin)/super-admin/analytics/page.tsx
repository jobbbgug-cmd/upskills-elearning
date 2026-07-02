"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { TrendingUp, Users, AlertTriangle, Trophy, Calendar } from "lucide-react";
import { PLAN_LABELS } from "@/lib/planLimits";
import LoadingSpinner from "@/components/LoadingSpinner";

interface MonthPoint { label: string; revenue: number; count: number; }
interface UserPoint  { label: string; count: number; }
interface TopInstitution { _id: string; name: string; slug: string; plan: string; revenue: number; bookings: number; }
interface ExpiringPlan   { _id: string; name: string; slug: string; plan: string; planExpiresAt: string; }

interface AnalyticsData {
  revenueChart:   MonthPoint[];
  usersChart:     UserPoint[];
  topInstitutions: TopInstitution[];
  expiringPlans:   ExpiringPlan[];
}

function BarChart({ data, maxVal, color, labelKey, valueKey, formatVal }: {
  data: Record<string, unknown>[];
  maxVal: number;
  color: string;
  labelKey: string;
  valueKey: string;
  formatVal?: (v: number) => string;
}) {
  if (data.length === 0) return <div className="text-center text-gray-300 text-sm py-8">ไม่มีข้อมูล</div>;
  return (
    <div className="flex items-end gap-2 h-40">
      {data.map((d, i) => {
        const val = Number(d[valueKey]) || 0;
        const pct = maxVal > 0 ? (val / maxVal) * 100 : 0;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0">
            <span className="text-xs text-gray-500 font-medium whitespace-nowrap">{formatVal ? formatVal(val) : val.toLocaleString()}</span>
            <div className="w-full rounded-t-lg transition-all" style={{ height: `${Math.max(pct, 3)}%`, backgroundColor: color }} />
            <span className="text-xs text-gray-400 truncate w-full text-center">{String(d[labelKey])}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function SuperAdminAnalyticsPage() {
  const [data,    setData]    = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/super-admin/analytics").then((r) => r.json()).then((d) => setData(d)).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!data)   return null;

  const maxRevenue = Math.max(...data.revenueChart.map((m) => m.revenue), 1);
  const maxUsers   = Math.max(...data.usersChart.map((m) => m.count), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics แพลตฟอร์ม</h1>
        <p className="text-gray-500 text-sm mt-1">ภาพรวมรายได้และผู้ใช้ทั้งหมด 6 เดือนล่าสุด</p>
      </div>

      {/* Revenue chart */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp className="w-5 h-5 text-green-500" />
          <h2 className="font-semibold text-gray-900">รายได้รายเดือน</h2>
        </div>
        <BarChart
          data={data.revenueChart as unknown as Record<string, unknown>[]}
          maxVal={maxRevenue}
          color="#22c55e"
          labelKey="label"
          valueKey="revenue"
          formatVal={(v) => v >= 1000 ? `฿${(v/1000).toFixed(1)}K` : `฿${v}`}
        />
        {data.revenueChart.length > 0 && (
          <div className="flex justify-between text-xs text-gray-400 mt-3 pt-3 border-t border-gray-50">
            <span>รวม {data.revenueChart.reduce((s, m) => s + m.count, 0)} bookings</span>
            <span>รายได้รวม ฿{data.revenueChart.reduce((s, m) => s + m.revenue, 0).toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* New users chart */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Users className="w-5 h-5 text-blue-500" />
          <h2 className="font-semibold text-gray-900">สมาชิกใหม่รายเดือน</h2>
        </div>
        <BarChart
          data={data.usersChart as unknown as Record<string, unknown>[]}
          maxVal={maxUsers}
          color="#6366f1"
          labelKey="label"
          valueKey="count"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top institutions */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h2 className="font-semibold text-gray-900">สถาบัน Top 5 (รายได้)</h2>
          </div>
          {data.topInstitutions.length === 0 ? (
            <p className="text-center text-gray-300 text-sm py-8">ไม่มีข้อมูล</p>
          ) : (
            <div className="space-y-3">
              {data.topInstitutions.map((inst, i) => (
                <div key={inst._id} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${i === 0 ? "bg-amber-100 text-amber-700" : i === 1 ? "bg-gray-100 text-gray-600" : "bg-orange-100 text-orange-600"}`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/super-admin/institutions`} className="text-sm font-medium text-gray-900 hover:text-violet-700 truncate block">{inst.name}</Link>
                    <div className="text-xs text-gray-400 mt-0.5">{PLAN_LABELS[inst.plan] ?? inst.plan} · {inst.bookings} bookings</div>
                  </div>
                  <span className="text-sm font-semibold text-green-600 shrink-0">฿{inst.revenue.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expiring plans */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <h2 className="font-semibold text-gray-900">แผนจะหมดอายุใน 30 วัน</h2>
          </div>
          {data.expiringPlans.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">ไม่มีแผนที่จะหมดอายุเร็วๆ นี้</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.expiringPlans.map((inst) => {
                const daysLeft = Math.ceil((new Date(inst.planExpiresAt).getTime() - Date.now()) / 86400000);
                return (
                  <div key={inst._id} className={`flex items-center gap-3 p-3 rounded-xl ${daysLeft <= 7 ? "bg-red-50" : "bg-orange-50"}`}>
                    <AlertTriangle className={`w-4 h-4 shrink-0 ${daysLeft <= 7 ? "text-red-500" : "text-orange-500"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{inst.name}</p>
                      <p className="text-xs text-gray-500">{PLAN_LABELS[inst.plan] ?? inst.plan}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold theme-link">เหลือ {daysLeft} วัน</p>
                      <p className="text-xs text-gray-400">{new Date(inst.planExpiresAt).toLocaleDateString("th-TH")}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
