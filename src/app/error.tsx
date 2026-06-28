"use client";
import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold text-gray-900">เกิดข้อผิดพลาดบางอย่าง</h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            ระบบพบปัญหาขณะโหลดหน้านี้<br />
            ลองรีเฟรชหน้าหรือกลับไปหน้าหลัก
          </p>
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            ลองใหม่
          </button>
          <a
            href="/"
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200 transition-colors"
          >
            <Home className="w-4 h-4" />
            หน้าหลัก
          </a>
        </div>
      </div>
    </div>
  );
}
