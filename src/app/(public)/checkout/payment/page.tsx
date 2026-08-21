"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Check, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

export default function PaymentMultiplePage() {
  const router = useRouter();
  const { items, getTotalPrice } = useCart();
  const [selectedPayment, setSelectedPayment] = useState<string>("promptpay");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const totalPrice = getTotalPrice();

  const handlePayment = async () => {
    if (selectedPayment === "promptpay") {
      setShowQRModal(true);
      return;
    }

    if (selectedPayment === "bank-transfer") {
      setShowBankModal(true);
      return;
    }

    setIsProcessing(true);
    try {
      const orderData = {
        courseIds: items.map(item => item.courseId),
        paymentMethod: selectedPayment,
        totalAmount: totalPrice,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (res.ok) {
        router.push("/student-dashboard");
      }
    } catch (error) {
      console.error("Payment error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">ไม่มีรายการสั่งซื้อ</p>
          <Link href="/courses" className="text-indigo-600 hover:text-indigo-700 font-medium">
            กลับไปหน้าคอร์ส
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="UPSkills"
                width={150}
                height={80}
                className="object-contain"
              />
              <h1 className="text-2xl font-bold text-gray-900">เลือกวิธีชำระเงิน</h1>
            </div>
            <Link
              href="/checkout/courses"
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="font-medium">กลับ</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Payment Methods */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">วิธีการชำระเงิน</h2>

              <div className="space-y-4">
                {/* PromptPay */}
                <label className="flex items-center p-6 border-2 rounded-xl cursor-pointer transition-all"
                  style={{borderColor: selectedPayment === 'promptpay' ? '#9333ea' : '#e5e7eb', backgroundColor: selectedPayment === 'promptpay' ? '#f3e8ff' : 'white'}}>
                  <input
                    type="radio"
                    name="payment"
                    value="promptpay"
                    checked={selectedPayment === 'promptpay'}
                    onChange={(e) => setSelectedPayment(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="ml-3 text-gray-900 font-medium">PromptPay (QR Code)</span>
                </label>

                {/* Bank Transfer */}
                <label className="flex items-center p-6 border-2 rounded-xl cursor-pointer transition-all"
                  style={{borderColor: selectedPayment === 'bank-transfer' ? '#9333ea' : '#e5e7eb', backgroundColor: selectedPayment === 'bank-transfer' ? '#f3e8ff' : 'white'}}>
                  <input
                    type="radio"
                    name="payment"
                    value="bank-transfer"
                    checked={selectedPayment === 'bank-transfer'}
                    onChange={(e) => setSelectedPayment(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="ml-3 text-gray-900 font-medium">โอนเงินธนาคาร</span>
                </label>

                {/* Credit Card */}
                <label className="flex items-center p-6 border-2 rounded-xl cursor-pointer transition-all"
                  style={{borderColor: selectedPayment === 'credit-card' ? '#9333ea' : '#e5e7eb', backgroundColor: selectedPayment === 'credit-card' ? '#f3e8ff' : 'white'}}>
                  <input
                    type="radio"
                    name="payment"
                    value="credit-card"
                    checked={selectedPayment === 'credit-card'}
                    onChange={(e) => setSelectedPayment(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="ml-3 text-gray-900 font-medium">บัตรเครดิต/เดบิต</span>
                </label>
              </div>

              {/* Order Summary */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">สรุปรายการสั่งซื้อ</h3>
                <div className="space-y-2 mb-4">
                  {items.map((item) => (
                    <div key={item.courseId} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.course.title}</span>
                      <span className="font-medium">฿{(item.course.price || 0).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                  <span className="font-semibold text-gray-900">ยอดรวม ({items.length} รายการ)</span>
                  <span className="text-2xl font-bold text-purple-600">฿{totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Checkout Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-6">สรุปยอดชำระ</h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">จำนวนรายการ</span>
                  <span className="font-medium">{items.length}</span>
                </div>
                <div className="flex justify-between text-sm pb-4 border-b border-gray-200">
                  <span className="text-gray-600">ยอดรวม</span>
                  <span className="font-medium">฿{totalPrice.toLocaleString()}</span>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">ยอดที่ต้องชำระ</span>
                  <span className="text-3xl font-bold text-purple-600">฿{totalPrice.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full bg-purple-600 text-white py-3 rounded-full font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {isProcessing ? "กำลังประมวลผล..." : "ยืนยันการชำระเงิน"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* QR Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">สแกน QR Code</h3>
            <div className="bg-gray-100 rounded-lg p-8 flex items-center justify-center mb-4" style={{aspectRatio: '1'}}>
              <div className="text-center">
                <p className="text-gray-500 mb-2">QR Code</p>
                <p className="text-sm text-gray-400">฿{totalPrice.toLocaleString()}</p>
              </div>
            </div>
            <button
              onClick={() => setShowQRModal(false)}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              ปิด
            </button>
          </div>
        </div>
      )}

      {/* Bank Modal */}
      {showBankModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">ข้อมูลการโอนเงิน</h3>
            <div className="space-y-2 mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm"><span className="font-medium">ธนาคาร:</span> ไทยพาณิชย์</p>
              <p className="text-sm"><span className="font-medium">บัญชี:</span> 123-456-789</p>
              <p className="text-sm"><span className="font-medium">ชื่อบัญชี:</span> UPSkills Co., Ltd.</p>
              <p className="text-sm"><span className="font-medium">จำนวนเงิน:</span> ฿{totalPrice.toLocaleString()}</p>
            </div>
            <button
              onClick={() => setShowBankModal(false)}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              ปิด
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
