"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, Plus, Pencil, Trash2 } from "lucide-react";

interface Course {
  _id: string;
  title: string;
  description: string;
  instructor: string;
  price: number;
  createdAt: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch("/api/courses");
        if (res.ok) {
          const data = await res.json();
          setCourses(Array.isArray(data) ? data : data.courses || []);
        }
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filtered = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(search.toLowerCase()) ||
      course.instructor.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">จัดการคอร์ส</h1>
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">จัดการคอร์ส</h1>
          <p className="text-sm text-gray-600 mt-1">รวม {courses.length} คอร์ส</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium">
          <Plus className="w-4 h-4" />
          เพิ่มคอร์สใหม่
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <input
          type="text"
          placeholder="ค้นหาคอร์ส หรือ ครู..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
        />
      </div>

      {/* Courses Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-semibold">คอร์ส</th>
                <th className="text-left py-3 px-4 font-semibold">ครู</th>
                <th className="text-right py-3 px-4 font-semibold">ราคา</th>
                <th className="text-left py-3 px-4 font-semibold">วันสร้าง</th>
                <th className="text-left py-3 px-4 font-semibold">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((course) => (
                <tr key={course._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{course.title}</td>
                  <td className="py-3 px-4 text-gray-600">{course.instructor}</td>
                  <td className="py-3 px-4 text-right">฿{course.price.toLocaleString()}</td>
                  <td className="py-3 px-4 text-gray-600">
                    {new Date(course.createdAt).toLocaleDateString("th-TH")}
                  </td>
                  <td className="py-3 px-4 flex gap-2">
                    <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <p className="text-gray-500">ไม่พบข้อมูลคอร์ส</p>
        </div>
      )}
    </div>
  );
}
