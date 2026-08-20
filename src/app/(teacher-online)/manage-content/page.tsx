"use client";

import { Plus } from "lucide-react";
import Link from "next/link";

export default function ManageContentPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">เนื้อหาการเรียน</h1>
          <p className="text-gray-500 text-sm mt-1">อัปโหลดวิดีโอ, ไฟล์, และเอกสารประกอบการสอน</p>
        </div>
        <Link
          href="/manage-content/create/online"
          className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          เพิ่มเนื้อหาการเรียน
        </Link>
      </div>

      {/* Empty State */}
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
        <p className="text-gray-500 mb-4">ยังไม่มีเนื้อหาใดๆ</p>
        <Link
          href="/manage-content/create/online"
          className="inline-flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          สร้างเนื้อหาการเรียนแรก
        </Link>
      </div>
    </div>
  );
}
