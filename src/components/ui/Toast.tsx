"use client";
import { useEffect } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

interface ToastProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`fixed top-6 right-6 z-[9999] flex items-start gap-3 px-4 py-3.5 rounded-2xl shadow-xl border max-w-sm animate-in slide-in-from-top-2 fade-in duration-200 ${
      type === "success"
        ? "bg-green-50 border-green-200 text-green-800"
        : "bg-red-50 border-red-200 text-red-800"
    }`}>
      {type === "success"
        ? <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
        : <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
      }
      <p className="text-sm font-medium flex-1">{message}</p>
      <button onClick={onClose} className="opacity-50 hover:opacity-100 transition-opacity">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
