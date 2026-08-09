"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Check } from "lucide-react";
import { useParams } from "next/navigation";

interface LearningPath {
  _id: string;
  title: string;
  price?: number;
  discount?: number;
  discountType?: "percentage" | "fixed";
}

export default function PaymentPage() {
  const params = useParams();
  const id = params.id as string;

  const [path, setPath] = useState<LearningPath | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<string>("credit-card");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchPath = async () => {
      try {
        const res = await fetch(`/api/learning-paths/${id}`);
        const data = await res.json();
        setPath(data.path);
      } catch (error) {
        console.error("Failed to fetch learning path:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPath();
  }, [id]);

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          learningPathId: id,
          paymentMethod: selectedPayment,
          type: "learning-path",
        }),
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        window.location.href = `/order-success/${data.orderId}`;
      } else {
        alert("ชำระเงินไม่สำเร็จ");
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("เกิดข้อผิดพลาดในการชำระเงิน");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">กำลังโหลด...</p>
      </div>
    );
  }

  if (!path) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">ไม่พบเส้นทางการเรียน</p>
          <Link href="/courses?tab=paths" className="text-indigo-600 hover:text-indigo-700 font-medium">
            กลับไปหน้าเส้นทาง
          </Link>
        </div>
      </div>
    );
  }

  const price = path.price || 0;
  const discount = path.discountType === "percentage" ? (price * (path.discount || 0) / 100) : (path.discount || 0);
  const finalPrice = price - discount;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3 mb-2">
            <Image
              src="/logo.png"
              alt="UPSkills"
              width={150}
              height={80}
              className="object-contain"
            />
            <h1 className="text-2xl font-bold text-gray-900">เลือกวิธีชำระเงิน</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Payment Methods */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-900 mb-6">วิธีการชำระเงิน</h2>

            <div className="space-y-4 mb-8">
              {/* Credit Card */}
              <label
                className="flex items-start gap-4 p-4 bg-white rounded-lg border-2 transition-all cursor-pointer"
                style={{
                  borderColor: selectedPayment === "credit-card" ? "#9333EA" : "#E5E7EB",
                  backgroundColor: selectedPayment === "credit-card" ? "#F9F5FF" : "#FFFFFF",
                }}
              >
                <div className="flex-1 pt-1">
                  <input
                    type="radio"
                    name="payment"
                    value="credit-card"
                    checked={selectedPayment === "credit-card"}
                    onChange={(e) => setSelectedPayment(e.target.value)}
                    className="absolute opacity-0 cursor-pointer"
                  />
                  <div className="flex items-start gap-3">
                    <div
                      className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                      style={{ borderColor: selectedPayment === "credit-card" ? "#9333EA" : "#D1D5DB" }}
                    >
                      {selectedPayment === "credit-card" && (
                        <Check className="w-4 h-4 text-purple-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">บัตรเครดิต/เดบิต</p>
                      <p className="text-sm text-gray-600">Visa, Mastercard, AmEx</p>
                    </div>
                  </div>
                </div>
                <span className="text-2xl">💳</span>
              </label>

              {/* Bank Transfer */}
              <label
                className="flex items-start gap-4 p-4 bg-white rounded-lg border-2 transition-all cursor-pointer"
                style={{
                  borderColor: selectedPayment === "bank-transfer" ? "#9333EA" : "#E5E7EB",
                  backgroundColor: selectedPayment === "bank-transfer" ? "#F9F5FF" : "#FFFFFF",
                }}
              >
                <div className="flex-1 pt-1">
                  <input
                    type="radio"
                    name="payment"
                    value="bank-transfer"
                    checked={selectedPayment === "bank-transfer"}
                    onChange={(e) => setSelectedPayment(e.target.value)}
                    className="absolute opacity-0 cursor-pointer"
                  />
                  <div className="flex items-start gap-3">
                    <div
                      className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                      style={{ borderColor: selectedPayment === "bank-transfer" ? "#9333EA" : "#D1D5DB" }}
                    >
                      {selectedPayment === "bank-transfer" && (
                        <Check className="w-4 h-4 text-purple-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">โอนเงินธนาคาร</p>
                      <p className="text-sm text-gray-600">โอนเงินจากบัญชีธนาคารของคุณ</p>
                    </div>
                  </div>
                </div>
                <span className="text-2xl">🏦</span>
              </label>

              {/* PromptPay */}
              <label
                className="flex items-start gap-4 p-4 bg-white rounded-lg border-2 transition-all cursor-pointer"
                style={{
                  borderColor: selectedPayment === "promptpay" ? "#9333EA" : "#E5E7EB",
                  backgroundColor: selectedPayment === "promptpay" ? "#F9F5FF" : "#FFFFFF",
                }}
              >
                <div className="flex-1 pt-1">
                  <input
                    type="radio"
                    name="payment"
                    value="promptpay"
                    checked={selectedPayment === "promptpay"}
                    onChange={(e) => setSelectedPayment(e.target.value)}
                    className="absolute opacity-0 cursor-pointer"
                  />
                  <div className="flex items-start gap-3">
                    <div
                      className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                      style={{ borderColor: selectedPayment === "promptpay" ? "#9333EA" : "#D1D5DB" }}
                    >
                      {selectedPayment === "promptpay" && (
                        <Check className="w-4 h-4 text-purple-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">PromptPay</p>
                      <p className="text-sm text-gray-600">สแกน QR Code เพื่อชำระเงิน</p>
                    </div>
                  </div>
                </div>
                <span className="text-2xl">📱</span>
              </label>
            </div>

            {/* Back Button */}
            <Link href={`/checkout/learning-paths/${id}`} className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium">
              <ChevronLeft className="w-5 h-5" />
              กลับไป
            </Link>
          </div>

          {/* Right Column: Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4">สรุปการชำระเงิน</h3>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-4 pb-4 border-b border-gray-200 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">ราคาสินค้า</span>
                  <span className="text-gray-900">฿{price.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>ส่วนลด</span>
                    <span>-฿{discount.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">ยอดชำระ</span>
                  <span className="text-4xl font-bold text-purple-600">
                    ฿{finalPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Proceed Button */}
              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full bg-purple-600 text-white py-3 rounded-full font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? "กำลังประมวลผล..." : "ยืนยันการชำระเงิน"}
              </button>

              {/* Security Note */}
              <p className="text-xs text-gray-500 text-center mt-4">
                ✓ ธุรกรรมของคุณมีความปลอดภัยและเข้ารหัสลับ
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
