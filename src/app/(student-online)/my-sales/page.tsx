"use client";

import { BarChart3, TrendingUp } from "lucide-react";

export default function MySalesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">คอร์สของฉัน</h1>
        <p className="text-gray-500 text-sm mt-1">ดูจำนวนลูกค้าที่ซื้อคอร์สของคุณ</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
        <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">คุณยังไม่มีคอร์สใดๆ</p>
        <a
          href="/manage-courses"
          className="inline-block mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
        >
          สร้างคอร์สแรก
        </a>
      </div>

      {/* Table Structure (for when there are courses) */}
      <div className="bg-white rounded-2xl border border-gray-200 hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">ชื่อคอร์ส</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">นักเรียน</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">ราคา</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">รายได้รวม</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">ดำเนิน</th>
              </tr>
            </thead>
          </table>
        </div>
      </div>
    </div>
  );
}
