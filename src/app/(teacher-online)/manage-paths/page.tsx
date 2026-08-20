"use client";

import { Plus, Layers } from "lucide-react";

export default function ManagePathsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">เส้นทางการเรียน</h1>
          <p className="text-gray-500 text-sm mt-1">จัดกลุ่มคอร์สเป็นเส้นทางการเรียนแบบบรรยาย</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
          <Plus className="w-4 h-4" />
          สร้างเส้นทาง
        </button>
      </div>

      {/* Empty State */}
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
        <Layers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 mb-4">คุณยังไม่มีเส้นทางการเรียนใดๆ</p>
        <button className="inline-block px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
          <Plus className="w-4 h-4 inline mr-2" />
          สร้างเส้นทางแรก
        </button>
      </div>

      {/* Table for existing paths */}
      <div className="bg-white rounded-2xl border border-gray-200 hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">ชื่อเส้นทาง</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">จำนวนคอร์ส</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">ราคา</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">นักเรียน</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">ดำเนิน</th>
              </tr>
            </thead>
          </table>
        </div>
      </div>
    </div>
  );
}
