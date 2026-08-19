"use client";

import { useState, useEffect } from "react";
import { DollarSign } from "lucide-react";

interface Payout {
  _id: string;
  institutionId: string;
  amount: number;
  status: string;
  createdAt: string;
}

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayouts = async () => {
      try {
        const res = await fetch("/api/super-admin/payouts");
        if (res.ok) {
          const data = await res.json();
          setPayouts(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Failed to fetch payouts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayouts();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">การเบิกเงิน</h1>
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">การเบิกเงิน</h1>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-semibold">สถาบัน</th>
                <th className="text-right py-3 px-4 font-semibold">จำนวนเงิน</th>
                <th className="text-left py-3 px-4 font-semibold">สถานะ</th>
                <th className="text-left py-3 px-4 font-semibold">วันที่</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((payout) => (
                <tr key={payout._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{payout.institutionId}</td>
                  <td className="py-3 px-4 text-right">฿{(payout.amount || 0).toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      payout.status === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {payout.status === "paid" ? "เบิกแล้ว" : "รอเบิก"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {new Date(payout.createdAt).toLocaleDateString("th-TH")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {payouts.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <p className="text-gray-500">ไม่พบข้อมูลการเบิกเงิน</p>
        </div>
      )}
    </div>
  );
}
