"use client";

import { useState } from "react";
import { FileText, CheckCircle, Clock } from "lucide-react";

export default function InvoiceRequestsPage() {
  const [invoices] = useState([]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ใบกำกับภาษี</h1>
        <p className="text-gray-500 text-sm mt-1">จัดการและสร้างใบกำกับภาษีให้ลูกค้า</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            <p className="text-gray-600 text-sm">รอการออก</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">0</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-gray-600 text-sm">ออกแล้ว</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">0</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <p className="text-gray-600 text-sm">รวมทั้งหมด</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">0</p>
        </div>
      </div>

      {/* Empty State */}
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">ยังไม่มีคำขอใบกำกับภาษี</p>
      </div>

      {/* Table Structure (for when there are invoices) */}
      <div className="bg-white rounded-2xl border border-gray-200 hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">ชื่อลูกค้า</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">เลขประจำตัวผู้เสียภาษี</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">คอร์ส</th>
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
