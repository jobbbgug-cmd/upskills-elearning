"use client";
import Link from "next/link";
import { Globe, Building2 } from "lucide-react";

export default function NewCoursePage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">สร้างคอร์สใหม่</h1>
        <p className="text-gray-500 text-sm mt-1">เลือกประเภทของคอร์สที่ต้องการสร้าง</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Online Course */}
        <Link href="/owner/courses/online/new" className="group">
          <div className="bg-white rounded-2xl border border-gray-100 p-8 hover:border-indigo-300 hover:shadow-lg transition-all h-full">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Globe className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">คอร์สออนไลน์</h2>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              คอร์สเรียนออนไลน์สดหรือบันทึก เรียนได้ตามเวลาของคุณ มีวิดีโอให้ชมย้อนหลัง
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="text-blue-500">✓</span> สอนสดผ่าน Jitsi Meet
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-500">✓</span> บันทึกคลิปสำหรับดูย้อนหลัง
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-500">✓</span> จำนวนนักเรียนไม่จำกัด
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-500">✓</span> สนับสนุนเนื้อหาดิจิทัล
              </li>
            </ul>
            <button className="mt-8 w-full px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors group-hover:shadow-md">
              สร้างคอร์สออนไลน์
            </button>
          </div>
        </Link>

        {/* Onsite Course */}
        <Link href="/owner/courses/onsite/new" className="group">
          <div className="bg-white rounded-2xl border border-gray-100 p-8 hover:border-orange-300 hover:shadow-lg transition-all h-full">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Building2 className="w-6 h-6 text-orange-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">หลักสูตร Onsite</h2>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              คอร์สเรียนที่สอนในสถาบัน กำหนดตารางเรียนและที่นั่งให้ชัดเจน
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="text-orange-500">✓</span> จัดตารางเรียนในสถาบัน
              </li>
              <li className="flex items-center gap-2">
                <span className="text-orange-500">✓</span> กำหนดจำนวนที่นั่งต่อรอบ
              </li>
              <li className="flex items-center gap-2">
                <span className="text-orange-500">✓</span> ระบบจองที่นั่ง
              </li>
              <li className="flex items-center gap-2">
                <span className="text-orange-500">✓</span> เช็คชื่อเข้าเรียน
              </li>
            </ul>
            <button className="mt-8 w-full px-4 py-3 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 transition-colors group-hover:shadow-md">
              สร้างหลักสูตร Onsite
            </button>
          </div>
        </Link>
      </div>
    </div>
  );
}
