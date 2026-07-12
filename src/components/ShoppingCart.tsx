"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";

interface ShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ShoppingCart({ isOpen, onClose }: ShoppingCartProps) {
  const { items, removeFromCart, toggleItem, getTotalPrice } = useCart();
  const totalPrice = getTotalPrice();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 cursor-pointer"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed right-0 top-0 h-screen w-96 bg-white shadow-2xl border-l border-gray-200 flex flex-col z-50 transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-gray-900">ตะกร้าสินค้าของคุณ</h2>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <p className="text-sm text-gray-600">คุณมี {items.length} รายการ ในตะกร้าสินค้า</p>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <p className="text-center text-gray-500 py-8 text-sm">ไม่มีสินค้าในตะกร้า</p>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.courseId} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white flex gap-3 p-3">

                  {/* Course Image - Left */}
                  <div className="relative w-40 h-24 flex-shrink-0 bg-gradient-to-br from-indigo-100 to-purple-100 overflow-hidden rounded">
                    {item.course.coverImage ? (
                      <Image
                        src={item.course.coverImage}
                        alt={item.course.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-xl">📚</div>
                    )}
                  </div>

                  {/* Course Details - Right */}
                  <div className="flex-1 min-w-0 flex flex-col">
                    <h4 className="font-bold text-xs text-gray-900 line-clamp-2 mb-1">
                      {item.course.title}
                    </h4>
                    <p className="text-xs text-gray-600 mb-auto">{item.course.instructor}</p>
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-indigo-600 text-sm">
                        ฿{item.course.price || 0}
                      </p>
                      <button
                        onClick={() => removeFromCart(item.courseId)}
                        className="p-1 hover:bg-red-100 rounded text-red-600 transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 p-4 space-y-3 bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">ยอดที่ต้องชำระ</span>
              <span className="text-2xl font-bold text-indigo-600">฿{totalPrice}</span>
            </div>

            <button className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-base">
              ชำระเงิน
            </button>
          </div>
        )}
      </div>
    </>
  );
}
