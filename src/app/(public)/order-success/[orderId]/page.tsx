"use client";

import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { useParams } from "next/navigation";

export default function OrderSuccessPage() {
  const params = useParams();
  const orderId = params.orderId as string;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full text-center">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 rounded-full p-4">
            <CheckCircle2 className="w-16 h-16 text-green-600" />
          </div>
        </div>

        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">ชำระเงินสำเร็จ!</h1>
        <p className="text-gray-600 mb-6">
          ขอบคุณที่ใช้บริการของเรา คำสั่งซื้อของคุณได้รับการยืนยันแล้ว
        </p>

        {/* Order ID */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">หมายเลขอ้างอิง</p>
          <p className="text-lg font-mono font-bold text-gray-900 break-all">{orderId}</p>
        </div>

        {/* Information */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
          <p className="text-sm text-blue-900">
            ✓ หลักฐานการชำระเงินของคุณได้รับการบันทึกแล้ว
            <br />
            ✓ คุณจะได้รับการติดต่อเร็วๆ นี้
          </p>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <Link href="/" className="block">
            <button className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
              กลับไปหน้าแรก
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
          <Link href="/dashboard" className="block">
            <button className="w-full border-2 border-purple-600 text-purple-600 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors">
              ไปยังแดชบอร์ด
            </button>
          </Link>
        </div>

        {/* Footer */}
        <p className="text-xs text-gray-500 mt-6">
          สำหรับข้อมูลเพิ่มเติม โปรดติดต่อเรา support@upskills.co
        </p>
      </div>
    </div>
  );
}
