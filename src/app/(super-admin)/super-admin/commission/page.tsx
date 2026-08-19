"use client";

import { useState, useEffect } from "react";
import { Percent, Building2 } from "lucide-react";

interface Commission {
  _id: string;
  institutionId: string;
  institutionName: string;
  rate: number;
  totalRevenue: number;
  commissionAmount: number;
  lastUpdated: string;
}

export default function CommissionPage() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommissions = async () => {
      try {
        const res = await fetch("/api/super-admin/commission");
        if (res.ok) {
          const data = await res.json();
          setCommissions(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Failed to fetch commissions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCommissions();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">การจัดการค่าคอมมิชชั่น</h1>
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  const totalRevenue = commissions.reduce((sum, c) => sum + c.totalRevenue, 0);
  const totalCommission = commissions.reduce((sum, c) => sum + c.commissionAmount, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">การจัดการค่าคอมมิชชั่น</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-2">รายได้รวม</p>
          <p className="text-3xl font-bold text-gray-900">
            ฿{totalRevenue.toLocaleString("th-TH", { maximumFractionDigits: 0 })}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-2">ค่าคอมมิชชั่นรวม</p>
          <p className="text-3xl font-bold text-purple-600">
            ฿{totalCommission.toLocaleString("th-TH", { maximumFractionDigits: 0 })}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-2">จำนวนสถาบัน</p>
          <p className="text-3xl font-bold text-blue-600">{commissions.length}</p>
        </div>
      </div>

      {/* Commission Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-semibold">สถาบัน</th>
                <th className="text-right py-3 px-4 font-semibold">อัตราค่าคอมมิชชั่น</th>
                <th className="text-right py-3 px-4 font-semibold">รายได้</th>
                <th className="text-right py-3 px-4 font-semibold">ค่าคอมมิชชั่น</th>
                <th className="text-left py-3 px-4 font-semibold">อัปเดตล่าสุด</th>
              </tr>
            </thead>
            <tbody>
              {commissions.map((commission) => (
                <tr key={commission._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      {commission.institutionName}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Percent className="w-4 h-4 text-gray-400" />
                      {commission.rate}%
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-semibold">
                    ฿{commission.totalRevenue.toLocaleString("th-TH", { maximumFractionDigits: 0 })}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-purple-600">
                    ฿{commission.commissionAmount.toLocaleString("th-TH", { maximumFractionDigits: 0 })}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {new Date(commission.lastUpdated).toLocaleDateString("th-TH")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {commissions.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <p className="text-gray-500">ไม่พบข้อมูลค่าคอมมิชชั่น</p>
        </div>
      )}
    </div>
  );
}
