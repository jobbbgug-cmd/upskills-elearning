"use client";
import { AlertTriangle, CheckCircle, XCircle, Trash2 } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: "danger" | "warning" | "success";
  onConfirm: () => void;
  onCancel: () => void;
}

const VARIANTS = {
  danger:  { icon: <Trash2 className="w-6 h-6 text-red-500" />,     btn: "bg-red-600 hover:bg-red-700 text-white",     ring: "bg-red-100" },
  warning: { icon: <AlertTriangle className="w-6 h-6 text-amber-500" />, btn: "bg-amber-500 hover:bg-amber-600 text-white", ring: "bg-amber-100" },
  success: { icon: <CheckCircle className="w-6 h-6 text-green-500" />,   btn: "bg-green-600 hover:bg-green-700 text-white", ring: "bg-green-100" },
};

export default function ConfirmDialog({
  open, title, message, confirmLabel = "ยืนยัน", cancelLabel = "ยกเลิก",
  type = "warning", onConfirm, onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;
  const v = VARIANTS[type];

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95 fade-in duration-150">
        <div className="flex flex-col items-center text-center gap-3">
          <div className={`w-14 h-14 rounded-full ${v.ring} flex items-center justify-center`}>
            {v.icon}
          </div>
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          {message && <p className="text-sm text-gray-500 leading-relaxed">{message}</p>}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => { onConfirm(); onCancel(); }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${v.btn}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
