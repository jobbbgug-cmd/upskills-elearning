"use client";

import { useState } from "react";
import Link from "next/link";
import { Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Toast from "@/components/ui/Toast";

interface LearningPathItem {
  _id: string;
  title: string;
  description: string;
  instructor: string;
  difficulty: string;
  courses: any[];
}

interface LearningPathsTableProps {
  paths: LearningPathItem[];
}

export default function LearningPathsTable({ paths: initialPaths }: LearningPathsTableProps) {
  const router = useRouter();
  const [paths, setPaths] = useState<LearningPathItem[]>(initialPaths);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("คุณแน่ใจหรือว่าต้องการลบเส้นทางการเรียนนี้?")) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`/api/learning-paths/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setPaths(paths.filter(p => p._id !== id));
        setToast({ message: "ลบเส้นทางการเรียนสำเร็จ!", type: "success" });
        setTimeout(() => setToast(null), 3000);
      } else {
        setToast({ message: "ไม่สามารถลบเส้นทางการเรียนได้", type: "error" });
      }
    } catch (error) {
      console.error("Delete error:", error);
      setToast({ message: "เกิดข้อผิดพลาด", type: "error" });
    } finally {
      setDeletingId(null);
    }
  };

  if (paths.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="text-center py-12 p-8">
          <p className="text-gray-600 mb-4">ยังไม่มีเส้นทางการเรียน</p>
          <Link href="/admin/learning-paths/new" className="inline-block theme-link font-medium">
            สร้างเส้นทางแรก →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">ชื่อเส้นทาง</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">ผู้สอน</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">จำนวนคอร์ส</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">ระดับ</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">การดำเนิน</th>
              </tr>
            </thead>
            <tbody>
              {paths.map((path) => (
                <tr key={path._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{path.title}</p>
                      <p className="text-sm text-gray-600 line-clamp-1">{path.description}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{path.instructor}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{path.courses?.length || 0}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      path.difficulty === "beginner" ? "bg-green-100 text-green-700" :
                      path.difficulty === "intermediate" ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {path.difficulty === "beginner" ? "ระดับเบื้องต้น" :
                       path.difficulty === "intermediate" ? "ระดับกลาง" : "ระดับสูง"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/learning-paths/${path._id}`} className="p-1.5 hover:bg-indigo-100 rounded text-indigo-600 transition-colors inline-flex">
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(path._id)}
                        disabled={deletingId === path._id}
                        className="p-1.5 hover:bg-red-100 rounded text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
