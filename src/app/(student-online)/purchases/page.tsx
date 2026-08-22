"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, CheckCircle2, Clock, X, Upload } from "lucide-react";
import { useRouter } from "next/navigation";

interface Order {
  _id: string;
  courseId?: any;
  learningPathId?: any;
  type: "course" | "learning-path";
  paymentMethod: string;
  slipUrl?: string;
  status: "pending" | "approved" | "rejected";
  orderDate: string;
  approvedDate?: string;
  rejectionReason?: string;
}

export default function PurchasesPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [uploadedSlip, setUploadedSlip] = useState<{ [key: string]: File }>({});

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders/my-orders");
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        } else if (res.status === 401) {
          router.push("/login");
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [router]);

  const handleSlipUpload = (orderId: string, file: File) => {
    setUploadedSlip((prev) => ({ ...prev, [orderId]: file }));
  };

  const handleReuploadSlip = async (orderId: string) => {
    const file = uploadedSlip[orderId];
    if (!file) {
      alert("กรุณาเลือกไฟล์ภาพสลิป");
      return;
    }

    setUploadingId(orderId);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error("Upload failed");
      }

      const uploadData = await uploadRes.json();
      const slipUrl = uploadData.url;

      // Update order status back to pending
      const updateRes = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slipUrl,
          status: "pending",
        }),
      });

      if (updateRes.ok) {
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId
              ? { ...order, slipUrl, status: "pending" as const }
              : order
          )
        );
        setUploadedSlip((prev) => {
          const updated = { ...prev };
          delete updated[orderId];
          return updated;
        });
        alert("อัปโหลดสลิปสำเร็จ และเปลี่ยนสถานะเป็นรออนุมัติแล้ว");
      }
    } catch (error) {
      console.error("Failed to reupload slip:", error);
      alert("ไม่สามารถอัปโหลดสลิปได้");
    } finally {
      setUploadingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full font-medium text-sm">
            <Clock className="w-4 h-4" />
            รออนุมัติ
          </div>
        );
      case "approved":
        return (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full font-medium text-sm">
            <CheckCircle2 className="w-4 h-4" />
            อนุมัติแล้ว
          </div>
        );
      case "rejected":
        return (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-800 rounded-full font-medium text-sm">
            <X className="w-4 h-4" />
            ไม่อนุมัติ
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">กำลังโหลด...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium mb-6">
            <ArrowLeft className="w-4 h-4" />
            กลับไปหน้าแรก
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">การซื้อของฉัน</h1>
          <p className="text-gray-600 mt-2">ดูสถานะการซื้อและสลิปการชำระเงิน</p>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <p className="text-gray-500 mb-4">ยังไม่มีการซื้อสินค้า</p>
            <Link href="/" className="text-purple-600 hover:text-purple-700 font-medium">
              ไปเลือกซื้อคอร์ส →
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const product = order.type === "course" ? order.courseId : order.learningPathId;
              return (
                <div key={order._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6">
                    {/* Product Info */}
                    <div className="flex gap-6 mb-6">
                      {product?.coverImage && (
                        <div className="w-32 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                          <img src={product.coverImage} alt={product.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{product?.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>📅 {new Date(order.orderDate).toLocaleDateString("th-TH")}</span>
                          <span>💳 {order.paymentMethod === "promptpay" ? "PromptPay" : order.paymentMethod === "bank-transfer" ? "โอนเงินธนาคาร" : "บัตรเครดิต"}</span>
                          <span className="font-semibold text-purple-600">฿{product?.price?.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Section */}
                    <div className="border-t border-gray-200 pt-6">
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="font-semibold text-gray-900">สถานะการอนุมัติ</h4>
                        {getStatusBadge(order.status)}
                      </div>

                      {/* Rejection Message */}
                      {order.status === "rejected" && order.rejectionReason && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                          <p className="text-sm text-red-800">
                            <strong>เหตุผลการไม่อนุมัติ:</strong> {order.rejectionReason}
                          </p>
                        </div>
                      )}

                      {/* Slip Section */}
                      {order.status !== "approved" && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                              สลิป/ใบเสร็จ {order.status === "rejected" ? "(อัปโหลดสลิปใหม่)" : ""}
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                              {order.slipUrl && order.status === "pending" ? (
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3 flex-1">
                                    <img src={order.slipUrl} alt="Slip" className="w-20 h-20 object-cover rounded" />
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">สลิปที่บันทึกแล้ว</p>
                                      <p className="text-xs text-gray-500">รอการอนุมัติจากแอดมิน</p>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <label className="cursor-pointer block">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                      if (e.target.files?.[0]) {
                                        handleSlipUpload(order._id, e.target.files[0]);
                                      }
                                    }}
                                    className="hidden"
                                  />
                                  <div className="flex flex-col items-center gap-2">
                                    <Upload className="w-6 h-6 text-gray-400" />
                                    <div className="text-center">
                                      {uploadedSlip[order._id] ? (
                                        <>
                                          <p className="text-sm font-medium text-gray-900">{uploadedSlip[order._id].name}</p>
                                          <p className="text-xs text-gray-500">คลิกเพื่อเปลี่ยน</p>
                                        </>
                                      ) : (
                                        <>
                                          <p className="text-sm font-medium text-gray-900">อัปโหลดสลิป/ใบเสร็จ</p>
                                          <p className="text-xs text-gray-500">คลิกเพื่อเลือกไฟล์</p>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </label>
                              )}
                            </div>
                          </div>

                          {/* Reupload Button */}
                          {order.status === "rejected" && uploadedSlip[order._id] && (
                            <button
                              onClick={() => handleReuploadSlip(order._id)}
                              disabled={uploadingId === order._id}
                              className="w-full bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
                            >
                              {uploadingId === order._id ? "กำลังอัปโหลด..." : "อัปโหลดสลิปและส่งอนุมัติอีกครั้ง"}
                            </button>
                          )}
                        </div>
                      )}

                      {/* Approved Message */}
                      {order.status === "approved" && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <p className="text-sm text-green-800">
                            ✓ อนุมัติแล้วเมื่อ {new Date(order.approvedDate || "").toLocaleDateString("th-TH")}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
