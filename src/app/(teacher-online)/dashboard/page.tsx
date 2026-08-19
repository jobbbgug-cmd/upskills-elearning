"use client";

import { TrendingUp, Users, FileText, BookOpen } from "lucide-react";

export default function TeacherDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">ภาพรวม</h1>
        <p className="text-gray-500 text-sm mt-1">ยินดีต้อนรับสู่แผงควบคุมครูออนไลน์</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm font-medium">คอร์สของฉัน</p>
            <BookOpen className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">0</p>
          <p className="text-xs text-gray-400 mt-2">รายการ</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm font-medium">นักเรียนทั้งหมด</p>
            <Users className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">0</p>
          <p className="text-xs text-gray-400 mt-2">คน</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm font-medium">รายได้รวม</p>
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">฿0</p>
          <p className="text-xs text-gray-400 mt-2">บาท</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm font-medium">ใบกำกับภาษี</p>
            <FileText className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">0</p>
          <p className="text-xs text-gray-400 mt-2">รายการ</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-8 text-white">
        <h2 className="text-2xl font-bold mb-4">เริ่มต้นอย่างไร?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="/manage-courses"
            className="bg-white/20 hover:bg-white/30 rounded-lg p-4 transition-colors"
          >
            <h3 className="font-bold mb-1">สร้างคอร์สแรกของคุณ</h3>
            <p className="text-sm opacity-90">เริ่มสอนนักเรียนของคุณวันนี้</p>
          </a>
          <a
            href="/manage-content"
            className="bg-white/20 hover:bg-white/30 rounded-lg p-4 transition-colors"
          >
            <h3 className="font-bold mb-1">เพิ่มเนื้อหาการเรียน</h3>
            <p className="text-sm opacity-90">อัปโหลดวิดีโอและเอกสารประกอบการสอน</p>
          </a>
        </div>
      </div>
    </div>
  );
}
