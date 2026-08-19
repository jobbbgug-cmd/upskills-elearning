"use client";

import { useState, useEffect } from "react";
import { BookOpen, Download, Play, CheckCircle } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

interface Course {
  _id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  courseType?: string;
  purchaseDate: string;
  paymentStatus: "completed" | "pending";
}

export default function CoursesOfMinePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await fetch("/api/online/courses-of-mine");
      if (res.ok) {
        const data = await res.json();
        setCourses(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">คอร์สของฉัน</h1>
        <p className="text-gray-500 text-sm mt-1">คอร์สที่คุณซื้อและชำระเงินแล้ว</p>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">คุณยังไม่ได้ซื้อคอร์สใดๆ</p>
          <a
            href="/courses"
            className="inline-block mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
          >
            ดูคอร์สทั้งหมด
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course) => (
            <div
              key={course._id}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {course.image && (
                <div className="w-full h-48 bg-gradient-to-br from-purple-400 to-pink-400 relative overflow-hidden">
                  <img
                    src={course.image}
                    alt={course.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{course.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{course.description}</p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900">
                    ฿{course.price.toLocaleString()}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                      course.paymentStatus === "completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {course.paymentStatus === "completed" ? (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        ชำระแล้ว
                      </>
                    ) : (
                      "รอชำระ"
                    )}
                  </span>
                </div>

                <div className="text-xs text-gray-400">
                  ซื้อเมื่อ {new Date(course.purchaseDate).toLocaleDateString("th-TH")}
                </div>

                <div className="flex gap-2 pt-4 border-t border-gray-100">
                  {course.paymentStatus === "completed" && (
                    <>
                      <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
                        <Play className="w-4 h-4" />
                        เข้าเรียน
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                        <Download className="w-4 h-4" />
                        ใบเสร็จ
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
