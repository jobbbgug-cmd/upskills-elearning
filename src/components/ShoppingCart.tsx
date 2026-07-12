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
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-lg flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">ตะกร้าสินค้า</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <p className="text-center text-gray-500 py-8">ไม่มีสินค้าในตะกร้า</p>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.courseId} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={item.selected}
                    onChange={() => toggleItem(item.courseId)}
                    className="w-5 h-5 rounded cursor-pointer mt-1"
                  />

                  {/* Course Info */}
                  <div className="flex-1 min-w-0">
                    <div className="relative h-16 w-full bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg overflow-hidden mb-2">
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

                    <h4 className="font-semibold text-sm text-gray-900 line-clamp-2">
                      {item.course.title}
                    </h4>
                    <p className="text-xs text-gray-600 mb-2">{item.course.instructor}</p>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-indigo-600">
                        ฿{item.course.price || 0}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.courseId)}
                        className="p-1 hover:bg-red-100 rounded text-red-600"
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
          <div className="border-t border-gray-200 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">ยอดที่ต้องชำระ</span>
              <span className="text-2xl font-bold text-indigo-600">฿{totalPrice}</span>
            </div>

            <button className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold">
              ชำระเงิน
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
