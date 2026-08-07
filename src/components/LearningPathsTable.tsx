"use client";

import { useState } from "react";
import Link from "next/link";
import { Edit, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";

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

interface Modal {
  type: "confirm" | "success" | "error";
  title: string;
  message: string;
  pathId?: string;
}

export default function LearningPathsTable({ paths: initialPaths }: LearningPathsTableProps) {
  const router = useRouter();
  const [paths, setPaths] = useState<LearningPathItem[]>(initialPaths);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [modal, setModal] = useState<Modal | null>(null);

  const handleDeleteClick = (id: string, title: string) => {
    setModal({
      type: "confirm",
      title: "ยืนยันการลบ",
      message: `คุณแน่ใจหรือว่าต้องการลบเส้นทางการเรียน "${title}" นี้?`,
      pathId: id,
    });
  };

  const handleConfirmDelete = async () => {
    if (!modal?.pathId) return;

    setDeletingId(modal.pathId);
    try {
      const res = await fetch(`/api/learning-paths/${modal.pathId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setPaths(paths.filter(p => p._id !== modal.pathId));
        setModal({
          type: "success",
          title: "ลบสำเร็จ",
          message: "ลบเส้นทางการเรียนสำเร็จแล้ว",
        });
        setTimeout(() => setModal(null), 2000);
      } else {
        setModal({
          type: "error",
          title: "ลบไม่สำเร็จ",
          message: "ไม่สามารถลบเส้นทางการเรียนได้",
        });
      }
    } catch (error) {
      console.error("Delete error:", error);
      setModal({
        type: "error",
        title: "ข้อผิดพลาด",
        message: "เกิดข้อผิดพลาดในการลบ",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const closeModal = () => {
    if (modal?.type === "confirm") {
      setModal(null);
    } else {
      setModal(null);
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
      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-xl">
            <div className="flex items-start justify-between mb-4">
              <h3 className={`text-lg font-bold ${
                modal.type === "confirm" ? "text-gray-900" :
                modal.type === "success" ? "text-green-600" :
                "text-red-600"
              }`}>
                {modal.title}
              </h3>
              <button
                onClick={closeModal}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <p className="text-gray-600 mb-6">{modal.message}</p>

            <div className="flex gap-3">
              {modal.type === "confirm" ? (
                <>
                  <button
                    onClick={closeModal}
                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    disabled={deletingId !== null}
                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingId ? "กำลังลบ..." : "ลบ"}
                  </button>
                </>
              ) : (
                <button
                  onClick={closeModal}
                  className={`w-full px-4 py-2.5 rounded-lg transition-colors font-medium text-white ${
                    modal.type === "success"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  ปิด
                </button>
              )}
            </div>
          </div>
        </div>
      )}

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
                        onClick={() => handleDeleteClick(path._id, path.title)}
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
