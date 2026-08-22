"use client";

import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";

interface DuplicateItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemName?: string;
}

export default function DuplicateItemModal({ isOpen, onClose, itemName = "รายการนี้" }: DuplicateItemModalProps) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full animate-in fade-in zoom-in duration-200">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <AlertCircle className="w-6 h-6 text-red-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              เพิ่มลงตะกร้าแล้ว
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {itemName}ลงตะกร้าแล้ว ไม่สามารถเพิ่ม{itemName}ซ้ำได้
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-lg transition-colors"
        >
          ตกลง
        </button>
      </div>
    </div>
  );
}
