"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";

interface DeleteCourseButtonProps {
  courseId: string;
}

export default function DeleteCourseButton({ courseId }: DeleteCourseButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("ต้องการลบคอร์สนี้หรือไม่?")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/super-admin/courses/${courseId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        window.location.reload();
      } else {
        alert("ลบไม่สำเร็จ");
      }
    } catch (error) {
      console.error("Delete failed:", error);
      alert("เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
      title="ลบ"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
