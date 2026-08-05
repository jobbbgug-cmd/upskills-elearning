"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function DeleteContentButton({ id, name }: { id: string; name: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);
    try {
      await fetch(`/api/owner/content/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ConfirmDialog
        open={open}
        title="ลบชุดเนื้อหา?"
        message={`"${name}" จะถูกลบถาวร คอร์สที่ใช้เนื้อหานี้จะไม่มีเนื้อหาแสดง`}
        confirmLabel="ลบ"
        type="danger"
        onConfirm={handleDelete}
        onCancel={() => setOpen(false)}
      />
      <button
        onClick={() => setOpen(true)}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors font-medium disabled:opacity-50"
      >
        <Trash2 className="w-3.5 h-3.5" />
        {loading ? "..." : "ลบ"}
      </button>
    </>
  );
}
