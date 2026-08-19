"use client";

import { Plus, BookOpen } from "lucide-react";

export default function ManageCoursesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">จัดการคอร์ส</h1>
          <p className="text-gray-500 text-sm mt-1">สร้างและจัดการคอร์สออนไลน์ของคุณ</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
          <Plus className="w-4 h-4" />
          สร้างคอร์สใหม่
        </button>
      </div>

      {/* Empty State */}
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
        <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 mb-4">คุณยังไม่มีคอร์สใดๆ</p>
        <button className="inline-block px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
          <Plus className="w-4 h-4 inline mr-2" />
          สร้างคอร์สแรก
        </button>
      </div>

      {/* Table for existing courses */}
      <div className="bg-white rounded-2xl border border-gray-200 hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">ชื่อคอร์ส</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">หมวดหมู่</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">ราคา</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">นักเรียน</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">สถานะ</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">ดำเนิน</th>
              </tr>
            </thead>
          </table>
        </div>
      </div>
    </div>
  );
}
