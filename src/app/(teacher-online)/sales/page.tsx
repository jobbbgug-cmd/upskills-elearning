"use client";

import { useState, useEffect } from "react";
import { TrendingUp, BookOpen, DollarSign, Calendar } from "lucide-react";

interface Order {
  _id: string;
  courseId: {
    _id: string;
    title: string;
    price: number;
    originalPrice?: number;
  };
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  amount: number;
  status: string;
  createdAt: string;
}

export default function SalesPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const res = await fetch("/api/admin/sales");
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Failed to fetch sales:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    totalSales: orders.length,
    totalRevenue: orders.reduce((sum, order) => sum + order.amount, 0),
    completedSales: orders.filter(o => o.status === "completed").length,
  };

  const courseSales = orders.reduce((acc: Record<string, { count: number; revenue: number; title: string }>, order) => {
    const courseId = order.courseId._id;
    if (!acc[courseId]) {
      acc[courseId] = { count: 0, revenue: 0, title: order.courseId.title };
    }
    acc[courseId].count++;
    acc[courseId].revenue += order.amount;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">รายได้</h1>
        <p className="text-gray-500 text-sm mt-1">ดูสถิติการขายและรายได้จากคอร์ส</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm font-medium">ยอดขายทั้งหมด</p>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{loading ? "-" : stats.totalSales}</p>
          <p className="text-xs text-gray-400 mt-2">รายการ</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm font-medium">รายได้รวม</p>
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">฿{loading ? "-" : stats.totalRevenue.toLocaleString("th-TH")}</p>
          <p className="text-xs text-gray-400 mt-2">บาท</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm font-medium">ยอดขายเสร็จสิ้น</p>
            <BookOpen className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{loading ? "-" : stats.completedSales}</p>
          <p className="text-xs text-gray-400 mt-2">รายการ</p>
        </div>
      </div>

      {/* Sales by Course */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500">กำลังโหลด...</p>
        </div>
      ) : Object.keys(courseSales).length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">ยังไม่มีการขายใด ๆ</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">ชื่อคอร์ส</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">จำนวนขาย</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">รายได้รวม</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">ราคาต่อหน่วย</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(courseSales).map(([courseId, data]) => (
                  <tr key={courseId} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{data.title}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {data.count} รายการ
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      ฿{data.revenue.toLocaleString("th-TH")}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      ฿{(data.revenue / data.count).toLocaleString("th-TH", { maximumFractionDigits: 0 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* All Orders */}
      {orders.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">รายการขายทั้งหมด</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">คอร์ส</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">ผู้ซื้อ</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">ราคา</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">สถานะ</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">วันที่</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 text-gray-900">{order.courseId.title}</td>
                    <td className="px-6 py-3 text-gray-700">
                      <div>
                        <p className="font-medium">{order.userId.name}</p>
                        <p className="text-xs text-gray-500">{order.userId.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-3 font-medium text-gray-900">
                      ฿{order.amount.toLocaleString("th-TH")}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        order.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : order.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      }`}>
                        {order.status === "completed"
                          ? "เสร็จสิ้น"
                          : order.status === "pending"
                          ? "รอดำเนิน"
                          : order.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-600 flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {new Date(order.createdAt).toLocaleDateString("th-TH")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
