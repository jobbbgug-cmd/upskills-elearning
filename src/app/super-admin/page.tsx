"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";

interface DashboardStats {
  totalUsers: number;
  totalInstitutions: number;
  totalCourses: number;
  totalRevenue: number;
  monthlyData?: Array<{ month: string; revenue: number; users: number }>;
}

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/super-admin/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">ภาพรวมระบบ</h1>
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">ภาพรวมระบบ</h1>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-2">จำนวนผู้ใช้งาน</p>
          <p className="text-3xl font-bold text-gray-900">
            {stats?.totalUsers?.toLocaleString() || "—"}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-2">จำนวนสถาบัน</p>
          <p className="text-3xl font-bold text-blue-600">
            {stats?.totalInstitutions?.toLocaleString() || "—"}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-2">จำนวนคอร์ส</p>
          <p className="text-3xl font-bold text-green-600">
            {stats?.totalCourses?.toLocaleString() || "—"}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-2">รายได้ทั้งหมด</p>
          <p className="text-3xl font-bold text-purple-600">
            ฿{stats?.totalRevenue?.toLocaleString("th-TH", { maximumFractionDigits: 0 }) || "—"}
          </p>
        </div>
      </div>

      {/* Chart */}
      {stats?.monthlyData && stats.monthlyData.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-bold mb-4">รายได้รายเดือน</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `฿${value.toLocaleString("th-TH", { maximumFractionDigits: 0 })}`} />
                <Bar dataKey="revenue" fill="#8B5CF6" name="รายได้" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-bold mb-4">จำนวนผู้ใช้รายเดือน</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#EC4899" name="ผู้ใช้งาน" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-bold mb-4">ลิงก์ด่วน</h2>
        <div className="grid grid-cols-4 gap-4">
          <a href="/super-admin/users" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
            <p className="text-2xl mb-2">👥</p>
            <p className="font-medium text-gray-900">จัดการผู้ใช้งาน</p>
          </a>
          <a href="/super-admin/revenue" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
            <p className="text-2xl mb-2">💰</p>
            <p className="font-medium text-gray-900">รายได้</p>
          </a>
          <a href="/super-admin/institutions" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
            <p className="text-2xl mb-2">🏢</p>
            <p className="font-medium text-gray-900">สถาบัน</p>
          </a>
          <a href="/super-admin/coupons" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
            <p className="text-2xl mb-2">🎟️</p>
            <p className="font-medium text-gray-900">คูปอง</p>
          </a>
        </div>
      </div>
    </div>
  );
}
