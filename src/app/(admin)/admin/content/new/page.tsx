"use client";
import Link from "next/link";
import { FileText, Radio, Building2 } from "lucide-react";

export default function NewContentPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">สร้างชุดเนื้อหาใหม่</h1>
        <p className="text-gray-500 text-sm mt-1">เลือกประเภทของเนื้อหาที่ต้องการสร้าง</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Online Course Content */}
        <Link href="/admin/content/create/online" className="group">
          <div className="bg-white rounded-2xl border border-gray-100 p-8 hover:border-blue-300 hover:shadow-lg transition-all h-full">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">คอร์สออนไลน์</h2>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              ชุดเนื้อหาสำหรับคอร์สเรียนออนไลน์ ที่นักเรียนเรียนได้ตามเวลาของตัวเอง
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="text-blue-500">✓</span> PPT และการนำเสนอ
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-500">✓</span> คลิปสอนและคลิปสรุป
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-500">✓</span> ไฟล์ดาวน์โหลด
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-500">✓</span> E-book และเอกสาร
              </li>
            </ul>
            <button className="mt-8 w-full px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors group-hover:shadow-md">
              สร้างเนื้อหาออนไลน์
            </button>
          </div>
        </Link>

        {/* Live Online Content */}
        <Link href="/admin/content/create/live-online" className="group">
          <div className="bg-white rounded-2xl border border-gray-100 p-8 hover:border-purple-300 hover:shadow-lg transition-all h-full">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Radio className="w-6 h-6 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Live Online</h2>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              ชุดเนื้อหาสำหรับคอร์สเรียน Live ที่มีการโต้ตอบแบบสดในเวลาที่กำหนด
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="text-purple-500">✓</span> PPT และการนำเสนอ
              </li>
              <li className="flex items-center gap-2">
                <span className="text-purple-500">✓</span> คลิปสอนสด
              </li>
              <li className="flex items-center gap-2">
                <span className="text-purple-500">✓</span> บันทึก Live
              </li>
              <li className="flex items-center gap-2">
                <span className="text-purple-500">✓</span> ไฟล์ดาวน์โหลด
              </li>
            </ul>
            <button className="mt-8 w-full px-4 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors group-hover:shadow-md">
              สร้างเนื้อหา Live
            </button>
          </div>
        </Link>

        {/* Onsite Content */}
        <Link href="/admin/content/create/onsite" className="group">
          <div className="bg-white rounded-2xl border border-gray-100 p-8 hover:border-orange-300 hover:shadow-lg transition-all h-full">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Building2 className="w-6 h-6 text-orange-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Onsite</h2>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              ชุดเนื้อหาสำหรับคอร์สเรียนในสถาบัน ที่สอนแบบเข้าเรียนที่สถานที่
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="text-orange-500">✓</span> PPT และการนำเสนอ
              </li>
              <li className="flex items-center gap-2">
                <span className="text-orange-500">✓</span> คลิปสอนและสรุป
              </li>
              <li className="flex items-center gap-2">
                <span className="text-orange-500">✓</span> เอกสารประกอบ
              </li>
              <li className="flex items-center gap-2">
                <span className="text-orange-500">✓</span> ไฟล์ดาวน์โหลด
              </li>
            </ul>
            <button className="mt-8 w-full px-4 py-3 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 transition-colors group-hover:shadow-md">
              สร้างเนื้อหา Onsite
            </button>
          </div>
        </Link>
      </div>
    </div>
  );
}
