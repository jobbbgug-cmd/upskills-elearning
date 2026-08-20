"use client";

import { Plus, FileText, Video, Zap } from "lucide-react";
import Link from "next/link";

export default function ManageContentPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">เนื้อหาการเรียน</h1>
        <p className="text-gray-500 text-sm mt-1">สร้างชุดเนื้อหา PPT, วิดีโอ และไฟล์สำหรับใช้กับคอร์ส</p>
      </div>

      {/* Content Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/manage-content/create/online"
          className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-purple-500 hover:shadow-lg transition-all"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <Video className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">คอร์สออนไลน์</h3>
          <p className="text-sm text-gray-500">เพิ่มวิดีโอ, ไฟล์ PDF และเอกสารประกอบ</p>
        </Link>

        <Link
          href="/manage-content/create/live-online"
          className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-purple-500 hover:shadow-lg transition-all"
        >
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <Zap className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Live Online</h3>
          <p className="text-sm text-gray-500">เพิ่มเนื้อหาสำหรับสอนแบบ Live</p>
        </Link>

        <Link
          href="/manage-content/create/onsite"
          className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-purple-500 hover:shadow-lg transition-all"
        >
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <FileText className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Onsite</h3>
          <p className="text-sm text-gray-500">เพิ่มเนื้อหาสำหรับคอร์สที่สถาบัน</p>
        </Link>
      </div>

      {/* Empty State */}
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 mb-4">ยังไม่มีเนื้อหาใดๆ</p>
        <Link
          href="/manage-content/create/online"
          className="inline-flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          เพิ่มเนื้อหาแรก
        </Link>
      </div>
    </div>
  );
}
