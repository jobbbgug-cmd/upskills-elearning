"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function DeleteCourseButton({ courseId }: { courseId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);
    try {
      await fetch(`/api/admin/courses/${courseId}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ConfirmDialog
        open={open}
        title="ลบคอร์สนี้?"
        message="การจองทั้งหมดของคอร์สนี้จะถูกลบด้วย ไม่สามารถกู้คืนได้"
        confirmLabel="ลบ"
        type="danger"
        onConfirm={handleDelete}
        onCancel={() => setOpen(false)}
      />
      <button
        onClick={() => setOpen(true)}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
      >
        <Trash2 className="w-3.5 h-3.5" />
        {loading ? "..." : "ลบ"}
      </button>
    </>
  );
}
