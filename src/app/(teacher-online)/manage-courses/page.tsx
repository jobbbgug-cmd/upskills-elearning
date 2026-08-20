"use client";

import { useState, useEffect } from "react";
import { Plus, BookOpen, Edit2, Trash2 } from "lucide-react";
import Link from "next/link";

interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  isActive: boolean;
  createdAt: string;
}

export default function ManageCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await fetch("/api/admin/courses");
      const data = await res.json();
      setCourses(data.courses || []);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ยืนยันการลบคอร์ส?")) return;

    try {
      const res = await fetch(`/api/admin/courses/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCourses(courses.filter(c => c._id !== id));
      }
    } catch (error) {
      console.error("Failed to delete course:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">จัดการคอร์ส</h1>
          <p className="text-gray-500 text-sm mt-1">สร้างและจัดการคอร์สออนไลน์ของคุณ</p>
        </div>
        <Link href="/manage-courses/create" className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
          <Plus className="w-4 h-4" />
          สร้างคอร์สใหม่
        </Link>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500">กำลังโหลด...</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">คุณยังไม่มีคอร์สใดๆ</p>
          <Link href="/manage-courses/create" className="inline-flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
            <Plus className="w-4 h-4" />
            สร้างคอร์สแรก
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">ชื่อคอร์ส</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">หมวดหมู่</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">ราคา</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">สถานะ</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course._id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{course.title}</p>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-1">{course.description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{course.category || "-"}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      ฿{course.price.toLocaleString("th-TH")}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        course.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}>
                        {course.isActive ? "เปิด" : "ปิด"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/manage-courses/${course._id}/edit`}
                          className="inline-flex items-center gap-1 px-3 py-1 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                          แก้ไข
                        </Link>
                        <button
                          onClick={() => handleDelete(course._id)}
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
