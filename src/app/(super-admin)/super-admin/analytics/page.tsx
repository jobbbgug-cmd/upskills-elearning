"use client";

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  totalCourses: number;
  activeCourses: number;
  totalBookings: number;
  confirmedBookings: number;
  totalRevenue: number;
  totalInstitutions: number;
  usersByRole?: Record<string, number>;
  coursesByType?: Record<string, number>;
  bookingsTrend?: Array<{ date: string; count: number }>;
}

const COLORS = ["#8B5CF6", "#EC4899", "#06B6D4", "#10B981", "#F59E0B", "#EF4444"];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch("/api/super-admin/analytics");
        if (res.ok) {
          const result = await res.json();
          setData(result);
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-gray-600">ไม่สามารถโหลดข้อมูลได้</p>
        </div>
      </div>
    );
  }

  const usersByRoleData = data.usersByRole
    ? Object.entries(data.usersByRole).map(([key, value]) => ({ name: key, value }))
    : [];

  const coursesByTypeData = data.coursesByType
    ? Object.entries(data.coursesByType).map(([key, value]) => ({ name: key, value }))
    : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Total Users</div>
          <div className="text-3xl font-bold text-gray-900">{data.totalUsers.toLocaleString()}</div>
          <div className="text-xs text-gray-400 mt-2">Active: {data.activeUsers.toLocaleString()}</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Total Courses</div>
          <div className="text-3xl font-bold text-blue-600">{data.totalCourses.toLocaleString()}</div>
          <div className="text-xs text-gray-400 mt-2">Active: {data.activeCourses.toLocaleString()}</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Total Revenue</div>
          <div className="text-3xl font-bold text-green-600">฿{data.totalRevenue.toLocaleString()}</div>
          <div className="text-xs text-gray-400 mt-2">Bookings: {data.totalBookings.toLocaleString()}</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Institutions</div>
          <div className="text-3xl font-bold text-purple-600">{data.totalInstitutions.toLocaleString()}</div>
          <div className="text-xs text-gray-400 mt-2">Confirmed: {data.confirmedBookings.toLocaleString()}</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {usersByRoleData.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-bold mb-4">Users by Role</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={usersByRoleData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {usersByRoleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => value.toLocaleString()} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {coursesByTypeData.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-bold mb-4">Courses by Type</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={coursesByTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: any) => value.toLocaleString()} />
                <Bar dataKey="value" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Bookings Trend */}
      {data.bookingsTrend && data.bookingsTrend.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold mb-4">Bookings Trend (Last 7 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.bookingsTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value: any) => value.toLocaleString()} />
              <Legend />
              <Bar dataKey="count" name="Bookings" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
