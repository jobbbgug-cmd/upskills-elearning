"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function DeleteContentButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`ลบชุดเนื้อหา "${name}" ?\n\n(คอร์สที่ใช้ชุดเนื้อหานี้จะไม่มีเนื้อหาแสดง)`)) return;
    setLoading(true);
    try {
      await fetch(`/api/admin/content/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors font-medium disabled:opacity-50"
    >
      <Trash2 className="w-3.5 h-3.5" />
      {loading ? "..." : "ลบ"}
    </button>
  );
}
