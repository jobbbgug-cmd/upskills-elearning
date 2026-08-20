"use client";

import { useState, useEffect } from "react";
import { Plus, FileText, Edit2, Trash2, Calendar } from "lucide-react";
import Link from "next/link";

interface ContentItem {
  _id: string;
  name: string;
  description: string;
  type: string;
  createdAt: string;
}

export default function ManageContentPage() {
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContents();
  }, []);

  const fetchContents = async () => {
    try {
      const res = await fetch("/api/admin/content");
      const data = await res.json();
      setContents(data.contents || []);
    } catch (error) {
      console.error("Failed to fetch contents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ยืนยันการลบเนื้อหา?")) return;

    try {
      const res = await fetch(`/api/admin/content/${id}`, { method: "DELETE" });
      if (res.ok) {
        setContents(contents.filter(c => c._id !== id));
      }
    } catch (error) {
      console.error("Failed to delete content:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">เนื้อหาการเรียน</h1>
          <p className="text-gray-500 text-sm mt-1">อัปโหลดวิดีโอ, ไฟล์, และเอกสารประกอบการสอน</p>
        </div>
        <Link
          href="/manage-content/create/online"
          className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          เพิ่มเนื้อหาการเรียน
        </Link>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500">กำลังโหลด...</p>
        </div>
      ) : contents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-6">คุณยังไม่มีเนื้อหาใดๆ</p>
          <Link
            href="/manage-content/create/online"
            className="inline-flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            สร้างเนื้อหาการเรียนแรก
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">ชื่อเนื้อหา</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">ประเภท</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">วันที่สร้าง</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {contents.map((content) => (
                  <tr key={content._id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{content.name}</p>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{content.description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                        {content.type === "online" ? "ออนไลน์" : content.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {new Date(content.createdAt).toLocaleDateString("th-TH")}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/manage-content/${content._id}/edit`}
                          className="inline-flex items-center gap-1 px-3 py-1 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                          แก้ไข
                        </Link>
                        <button
                          onClick={() => handleDelete(content._id)}
                          className="inline-flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          ลบ
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
