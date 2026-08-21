"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { X, Trash2, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";

interface ShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ShoppingCart({ isOpen, onClose }: ShoppingCartProps) {
  const router = useRouter();
  const { items, removeFromCart, toggleItem, getTotalPrice } = useCart();
  const totalPrice = getTotalPrice();

  const handleCheckout = () => {
    const selectedItems = items.filter(item => item.selected);
    if (selectedItems.length === 0) {
      alert("กรุณาเลือกรายการอย่างน้อย 1 รายการ");
      return;
    }

    onClose();

    // Multiple selected items: go to multi-course checkout page
    if (selectedItems.length > 1) {
      router.push("/checkout/courses");
    } else {
      // Single selected item: go to individual course checkout page
      router.push(`/checkout/courses/${selectedItems[0].courseId}`);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 hidden lg:block"
        onClick={onClose}
      />

      {/* Floating Cart Box */}
      <div className="fixed right-4 top-20 w-[520px] z-50 hidden lg:block">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl overflow-hidden flex flex-col" style={{height: 'fit-content', maxHeight: 'calc(100vh - 120px)'}}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white flex-shrink-0">
            <h2 className="text-base font-bold text-gray-900">ตะกร้าสินค้า ({items.length})</h2>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <div className="flex items-center justify-center py-12 px-6">
                <p className="text-center text-gray-500 text-sm">ไม่มีสินค้าในตะกร้า</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {items.map((item) => (
                  <div key={item.courseId} className="px-4 py-4 hover:bg-gray-50 transition-colors">
                    {/* Course Card */}
                    <div className="flex gap-4 items-start">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={() => toggleItem(item.courseId)}
                        className="w-4 h-4 rounded border-gray-300 text-purple-600 mt-8 cursor-pointer flex-shrink-0"
                      />

                      {/* Course Image */}
                      <div className="relative w-40 h-24 flex-shrink-0 bg-gradient-to-br from-indigo-100 to-purple-100 overflow-hidden rounded-lg border border-gray-100">
                        {item.course.coverImage ? (
                          <Image
                            src={item.course.coverImage}
                            alt={item.course.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-2xl">📚</div>
                        )}
                      </div>

                      {/* Course Details */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <h4 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-1">
                            {item.course.title}
                          </h4>
                          <p className="text-xs text-gray-500 mb-2">{item.course.instructor || 'UPSkills'}</p>
                        </div>

                        {/* Price and Remove */}
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-red-600 text-sm">
                            ฿{item.course.price || 0}
                          </p>
                          <button
                            onClick={() => removeFromCart(item.courseId)}
                            className="text-gray-400 hover:text-red-600 transition-colors p-1"
                            title="ลบออกจากตะกร้า"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">ยอดรวม ({items.length} รายการ)</span>
                <span className="text-2xl font-bold text-red-600">฿{totalPrice}</span>
              </div>

              <button onClick={handleCheckout} className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold text-sm text-center block">
                ชำระเงิน
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
