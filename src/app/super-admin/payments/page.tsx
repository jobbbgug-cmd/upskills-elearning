"use client";

import { useState, useEffect } from "react";
import { CreditCard, Search } from "lucide-react";

interface Payment {
  _id: string;
  orderId: string;
  amount: number;
  method: string;
  status: string;
  createdAt: string;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // Placeholder for payments data
    setLoading(false);
  }, []);

  const filtered = payments.filter((payment) =>
    payment.orderId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">ประวัติการชำระเงิน</h1>
          <p className="text-sm text-gray-600 mt-1">รวม {payments.length} รายการ</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="ค้นหาหมายเลขคำสั่งซื้อ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
          />
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-semibold">หมายเลขคำสั่งซื้อ</th>
                <th className="text-right py-3 px-4 font-semibold">จำนวนเงิน</th>
                <th className="text-left py-3 px-4 font-semibold">วิธีการชำระ</th>
                <th className="text-left py-3 px-4 font-semibold">สถานะ</th>
                <th className="text-left py-3 px-4 font-semibold">วันที่</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((payment) => (
                <tr key={payment._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{payment.orderId}</td>
                  <td className="py-3 px-4 text-right">฿{payment.amount.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className="flex items-center gap-1">
                      <CreditCard className="w-4 h-4" />
                      {payment.method}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        payment.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : payment.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {payment.status === "completed"
                        ? "สำเร็จ"
                        : payment.status === "pending"
                          ? "รอตรวจสอบ"
                          : "ล้มเหลว"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {new Date(payment.createdAt).toLocaleDateString("th-TH")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filtered.length === 0 && !loading && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <p className="text-gray-500">ไม่พบข้อมูลการชำระเงิน</p>
        </div>
      )}
    </div>
  );
}
