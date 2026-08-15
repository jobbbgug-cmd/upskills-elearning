"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Check, X, Upload } from "lucide-react";
import { useParams } from "next/navigation";

interface Product {
  _id: string;
  title: string;
  price?: number;
  discount?: number;
  discountType?: "percentage" | "fixed";
}

export default function PaymentPage() {
  const params = useParams();
  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<string>("promptpay");
  const [isProcessing, setIsProcessing] = useState(false);
  const [productType, setProductType] = useState<"course" | "learning-path" | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // Try to fetch as course first
        const courseRes = await fetch(`/api/courses/${id}`);
        if (courseRes.ok) {
          const data = await courseRes.json();
          setProduct(data.course);
          setProductType("course");
          return;
        }

        // If not a course, try as learning path
        const pathRes = await fetch(`/api/learning-paths/${id}`);
        if (pathRes.ok) {
          const data = await pathRes.json();
          setProduct(data.path);
          setProductType("learning-path");
          return;
        }

        console.error("Failed to fetch product");
      } catch (error) {
        console.error("Failed to fetch product:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

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
      const orderData = productType === "course"
        ? { courseId: id, paymentMethod: selectedPayment, type: "course" }
        : { learningPathId: id, paymentMethod: selectedPayment, type: "learning-path" };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
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

  const handleQRConfirm = async () => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("paymentMethod", "promptpay");
      formData.append("type", productType === "course" ? "course" : "learning-path");
      if (productType === "course") {
        formData.append("courseId", id);
      } else {
        formData.append("learningPathId", id);
      }
      if (uploadedFile) {
        formData.append("slip", uploadedFile);
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        body: formData,
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

  const handleBankConfirm = async () => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("paymentMethod", "bank-transfer");
      formData.append("type", productType === "course" ? "course" : "learning-path");
      if (productType === "course") {
        formData.append("courseId", id);
      } else {
        formData.append("learningPathId", id);
      }
      if (uploadedFile) {
        formData.append("slip", uploadedFile);
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        body: formData,
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

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">ไม่พบสินค้า</p>
          <Link href="/courses" className="text-indigo-600 hover:text-indigo-700 font-medium">
            กลับไปหน้าคอร์ส
          </Link>
        </div>
      </div>
    );
  }

  const price = product.price || 0;
  const discountType = product.discountType || "percentage";
  const discount = discountType === "percentage" ? (price * (product.discount || 0) / 100) : (product.discount || 0);
  const finalPrice = price - discount;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-2">
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
              href={`/checkout/${productType === "course" ? "courses" : "learning-paths"}/${id}`}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="font-medium">กลับ</span>
            </Link>
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

              {/* Credit Card - Disabled */}
              <label
                className="flex items-start gap-4 p-4 bg-gray-100 rounded-lg border-2 transition-all cursor-not-allowed opacity-60"
                style={{
                  borderColor: "#E5E7EB",
                }}
              >
                <div className="flex-1 pt-1">
                  <input
                    type="radio"
                    name="payment"
                    value="credit-card"
                    disabled
                    className="absolute opacity-0 cursor-not-allowed"
                  />
                  <div className="flex items-start gap-3">
                    <div
                      className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                      style={{ borderColor: "#D1D5DB" }}
                    >
                    </div>
                    <div>
                      <p className="font-semibold text-gray-600">บัตรเครดิต/เดบิต</p>
                      <p className="text-sm text-gray-500">Visa, Mastercard, AmEx (ปิดปรับปรุง)</p>
                    </div>
                  </div>
                </div>
                <span className="text-2xl">💳</span>
              </label>
            </div>

            {/* Back Button */}
            <Link href={`/checkout/${productType === "course" ? "courses" : "learning-paths"}/${id}`} className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium">
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

      {/* Bank Transfer Modal */}
      {showBankModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">ชำระเงินผ่านโอนเงินธนาคาร</h2>
              <button
                onClick={() => {
                  setShowBankModal(false);
                  setUploadedFile(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Bank Details */}
            <div className="mb-6 bg-blue-50 rounded-lg p-4 space-y-3">
              <div>
                <p className="text-xs text-gray-600 mb-1">ชื่อบัญชี</p>
                <p className="text-sm font-semibold text-gray-900">UPSkills Co., Ltd.</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">ธนาคาร</p>
                <p className="text-sm font-semibold text-gray-900">ธนาคารกรุงเทพ (Bangkok Bank)</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">เลขที่บัญชี</p>
                <p className="text-sm font-semibold text-gray-900 font-mono">123-456-7890</p>
              </div>
              <div className="border-t border-blue-200 pt-3">
                <p className="text-xs text-gray-600 mb-1">จำนวนเงินที่ต้องโอน</p>
                <p className="text-lg font-bold text-purple-600">฿{(product?.price || 0).toLocaleString()}</p>
              </div>
            </div>

            {/* Instructions */}
            <p className="text-sm text-gray-600 mb-4 p-3 bg-gray-50 rounded">
              กรุณาโอนเงินตามจำนวนที่ระบุข้างต้น และแนบหลักฐานการโอนเงิน
            </p>

            {/* File Upload */}
            <div className="mb-6 border-2 border-dashed border-gray-300 rounded-lg p-4">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setUploadedFile(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-6 h-6 text-gray-400" />
                  <div className="text-center">
                    {uploadedFile ? (
                      <>
                        <p className="text-sm font-medium text-gray-900">{uploadedFile.name}</p>
                        <p className="text-xs text-gray-500">คลิกเพื่อเปลี่ยน</p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-gray-900">แนบสลิป/ใบเสร็จ</p>
                        <p className="text-xs text-gray-500">คลิกเพื่อเลือกไฟล์</p>
                      </>
                    )}
                  </div>
                </div>
              </label>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowBankModal(false);
                  setUploadedFile(null);
                }}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleBankConfirm}
                disabled={isProcessing}
                className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? "กำลังประมวลผล..." : "ยืนยันการชำระ"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PromptPay QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">ชำระเงินผ่าน PromptPay</h2>
              <button
                onClick={() => {
                  setShowQRModal(false);
                  setUploadedFile(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* QR Code Section */}
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-4">สแกน QR Code นี้เพื่อชำระเงิน</p>
              <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center mb-4">
                <div className="w-48 h-48 bg-gradient-to-br from-gray-300 to-gray-400 rounded-lg flex items-center justify-center">
                  <span className="text-6xl">📱</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 text-center">
                ยอดชำระ: <span className="font-bold">฿{(product?.price || 0).toLocaleString()}</span>
              </p>
            </div>

            {/* File Upload */}
            <div className="mb-6 border-2 border-dashed border-gray-300 rounded-lg p-4">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setUploadedFile(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-6 h-6 text-gray-400" />
                  <div className="text-center">
                    {uploadedFile ? (
                      <>
                        <p className="text-sm font-medium text-gray-900">{uploadedFile.name}</p>
                        <p className="text-xs text-gray-500">คลิกเพื่อเปลี่ยน</p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-gray-900">แนบสลิป/ใบเสร็จ</p>
                        <p className="text-xs text-gray-500">คลิกเพื่อเลือกไฟล์</p>
                      </>
                    )}
                  </div>
                </div>
              </label>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowQRModal(false);
                  setUploadedFile(null);
                }}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleQRConfirm}
                disabled={isProcessing}
                className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? "กำลังประมวลผล..." : "ยืนยันการชำระ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
