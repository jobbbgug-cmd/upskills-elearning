"use client";
import { useState, useEffect } from "react";
import { BookOpen, Play, CheckCircle, Clock } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

interface Course {
  _id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  instructor?: string;
  progress?: number;
  status: "in-progress" | "completed" | "not-started";
}

export default function MyCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const res = await fetch("/api/student-online/courses");
        if (res.ok) {
          setCourses(await res.json());
        }
      } catch (error) {
        console.error("Error loading courses:", error);
      }
      setLoading(false);
    };
    loadCourses();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">คอร์สของฉัน</h1>
        <p className="text-sm text-gray-600 mt-1">คอร์สที่คุณลงทะเบียนแล้ว</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <button className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700">
          ทั้งหมด
        </button>
        <button className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">
          กำลังเรียน
        </button>
        <button className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">
          เรียนจบแล้ว
        </button>
      </div>

      {/* Courses Grid */}
      {courses.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">ยังไม่มีคอร์สที่ลงทะเบียน</p>
          <p className="text-sm text-gray-500 mt-1">ไปที่ตะกร้าสินค้าเพื่อเลือกคอร์สใหม่</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              {course.image && (
                <img src={course.image} alt={course.name} className="w-full h-48 object-cover" />
              )}
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{course.name}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>

                {/* Progress Bar */}
                {course.progress !== undefined && (
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-medium text-gray-700">ความคืบหน้า</span>
                      <span className="text-xs font-medium text-gray-600">{course.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-violet-600 h-2 rounded-full transition-all"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Status Badge */}
                <div className="flex items-center gap-2 mb-4">
                  {course.status === "completed" ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-xs font-medium text-green-600">เรียนจบแล้ว</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4 text-orange-600" />
                      <span className="text-xs font-medium text-orange-600">กำลังเรียน</span>
                    </>
                  )}
                </div>

                {/* Continue Button */}
                <button className="w-full bg-violet-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-violet-700 flex items-center justify-center gap-2">
                  <Play className="w-4 h-4" />
                  เรียนต่อ
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
