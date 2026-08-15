"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface RevenueData {
  role: string;
  courseStats: Array<{
    _id: string;
    title: string;
    instructor: string;
    price: number;
    confirmedBookings: number;
    revenue: number;
    commissionAmount: number;
    commissionRate: number;
  }>;
  monthly: Array<{ month: string; revenue: number; commission: number }>;
  totalRevenue: number;
  totalCommissionAmount: number;
  totalPending: number;
  totalConfirmed: number;
  byTeacher?: Array<{
    instructor: string;
    totalRevenue: number;
    totalConfirmed: number;
  }>;
}

export default function RevenuePage() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const res = await fetch("/api/admin/revenue");
        const result = await res.json();
        setData(result);
      } catch (error) {
        console.error("Failed to fetch revenue:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenue();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">รายได้</h1>
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">รายได้</h1>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-gray-600">ไม่สามารถโหลดข้อมูลได้</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">รายได้</h1>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-2">รายได้ทั้งหมด</p>
          <p className="text-3xl font-bold text-gray-900">
            ฿{data.totalRevenue.toLocaleString("th-TH", { maximumFractionDigits: 0 })}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-2">ค่าคอมมิชชั่น</p>
          <p className="text-3xl font-bold text-purple-600">
            ฿{data.totalCommissionAmount.toLocaleString("th-TH", { maximumFractionDigits: 0 })}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-2">จำนวนการจอง (ยืนยันแล้ว)</p>
          <p className="text-3xl font-bold text-green-600">{data.totalConfirmed.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-2">รายได้รอชำระ</p>
          <p className="text-3xl font-bold text-orange-600">
            ฿{data.totalPending.toLocaleString("th-TH", { maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>

      {/* Monthly Revenue Chart */}
      {data.monthly && data.monthly.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold mb-4">รายได้ตามเดือน</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.monthly}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: any) => `฿${(value || 0).toLocaleString("th-TH", { maximumFractionDigits: 0 })}`} />
              <Legend />
              <Bar dataKey="revenue" name="รายได้" fill="#8B5CF6" />
              <Bar dataKey="commission" name="ค่าคอมมิชชั่น" fill="#EC4899" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* By Teacher */}
      {data.byTeacher && data.byTeacher.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold mb-4">รายได้ตามครู</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold">ชื่อครู</th>
                  <th className="text-right py-3 px-4 font-semibold">รายได้</th>
                  <th className="text-right py-3 px-4 font-semibold">จำนวนการจอง</th>
                </tr>
              </thead>
              <tbody>
                {data.byTeacher.map((teacher, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">{teacher.instructor}</td>
                    <td className="text-right py-3 px-4 font-semibold">
                      ฿{teacher.totalRevenue.toLocaleString("th-TH", { maximumFractionDigits: 0 })}
                    </td>
                    <td className="text-right py-3 px-4">{teacher.totalConfirmed.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Course Stats Table */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-bold mb-4">รายได้ตามคอร์ส</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-semibold">คอร์ส</th>
                <th className="text-left py-3 px-4 font-semibold">ครู</th>
                <th className="text-right py-3 px-4 font-semibold">ราคา</th>
                <th className="text-right py-3 px-4 font-semibold">จำนวนการจอง</th>
                <th className="text-right py-3 px-4 font-semibold">รายได้</th>
                <th className="text-right py-3 px-4 font-semibold">ค่าคอมมิชชั่น</th>
              </tr>
            </thead>
            <tbody>
              {data.courseStats.map((course) => (
                <tr key={course._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{course.title}</td>
                  <td className="py-3 px-4">{course.instructor}</td>
                  <td className="text-right py-3 px-4">฿{course.price.toLocaleString()}</td>
                  <td className="text-right py-3 px-4">{course.confirmedBookings}</td>
                  <td className="text-right py-3 px-4 font-semibold text-green-600">
                    ฿{course.revenue.toLocaleString("th-TH", { maximumFractionDigits: 0 })}
                  </td>
                  <td className="text-right py-3 px-4 font-semibold text-purple-600">
                    ฿{course.commissionAmount.toLocaleString("th-TH", { maximumFractionDigits: 0 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
