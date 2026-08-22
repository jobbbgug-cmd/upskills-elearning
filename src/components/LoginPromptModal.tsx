"use client";

import { X, LogIn, UserPlus } from "lucide-react";
import Link from "next/link";

interface LoginPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginPromptModal({ isOpen, onClose }: LoginPromptModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl">
        {/* Close Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-purple-100 rounded-full p-4">
            <LogIn className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        {/* Content */}
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">
          จำเป็นต้องเข้าสู่ระบบ
        </h2>
        <p className="text-gray-600 text-center mb-8">
          ไม่สามารถเพิ่มสินค้าลงตะกร้าได้ กรุณาเข้าสู่ระบบหรือสมัครสมาชิกก่อน
        </p>

        {/* Buttons */}
        <div className="space-y-3">
          <Link href="/login" className="block">
            <button
              onClick={onClose}
              className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              เข้าสู่ระบบ
            </button>
          </Link>
          <Link href="/register" className="block">
            <button
              onClick={onClose}
              className="w-full bg-white border-2 border-purple-600 text-purple-600 py-3 rounded-xl font-semibold hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              สมัครสมาชิกใหม่
            </button>
          </Link>
        </div>

        {/* Footer */}
        <p className="text-xs text-gray-500 text-center mt-6">
          มี 400+ คอร์สเรียนรออยู่หลังจากเข้าสู่ระบบ
        </p>
      </div>
    </div>
  );
}
