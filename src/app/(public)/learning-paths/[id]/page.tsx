"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, Users, BookOpen, ShoppingCart } from "lucide-react";
import { useParams } from "next/navigation";

interface Course {
  _id: string;
  title: string;
  slug: string;
  thumbnail?: string;
  instructorName?: string;
  coverImage?: string;
  description?: string;
  duration?: number;
  price?: number;
  enrollmentCount?: number;
  category?: string | { name: string };
}

interface LearningPath {
  _id: string;
  title: string;
  description: string;
  coverImage: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedHours: number;
  courses: Course[];
  instructor: string;
}

const difficultyColors = {
  beginner: { bg: "bg-green-50", text: "text-green-700", label: "ผู้เริ่มต้น" },
  intermediate: { bg: "bg-blue-50", text: "text-blue-700", label: "ระดับกลาง" },
  advanced: { bg: "bg-red-50", text: "text-red-700", label: "ขั้นสูง" },
};

const formatDuration = (hours: number): string => {
  if (hours === 0) return "0 นาที";

  const totalMinutes = Math.round(hours * 60);

  if (totalMinutes < 60) {
    return `${totalMinutes} นาที`;
  } else {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h}.${m.toString().padStart(2, "0")} ชม.`;
  }
};

export default function LearningPathDetail() {
  const params = useParams();
  const id = params.id as string;

  const [path, setPath] = useState<LearningPath | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPath = async () => {
      try {
        const res = await fetch(`/api/learning-paths/${id}`);
        const data = await res.json();
        setPath(data.path);
      } catch (error) {
        console.error("Failed to fetch learning path:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPath();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">กำลังโหลด...</p>
      </div>
    );
  }

  if (!path) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">ไม่พบเส้นทางการเรียน</p>
          <Link href="/learning-paths" className="text-indigo-600 hover:text-indigo-700 font-medium">
            กลับไปหน้าเส้นทาง
          </Link>
        </div>
      </div>
    );
  }

  const diff = difficultyColors[path.difficulty];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/learning-paths" className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium text-sm">
            <ArrowLeft className="w-4 h-4" />
            กลับไป
          </Link>
        </div>
      </div>

      {/* Main Content - Cover Image + Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Cover Image & Info */}
          <div className="lg:col-span-2">
            {/* Cover Image */}
            <div className="h-[450px] bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl overflow-hidden mb-6 flex items-center justify-center">
              {path.coverImage ? (
                <img src={path.coverImage} alt={path.title} className="w-full h-full object-cover" />
              ) : (
                <span className="text-6xl">🗺️</span>
              )}
            </div>

            {/* Title & Description */}
            <div>
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{path.title}</h1>
                  <p className="text-gray-600 text-lg">{path.description}</p>
                </div>
                <span className={`${diff.bg} ${diff.text} px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0`}>
                  {diff.label}
                </span>
              </div>
            </div>
          </div>

          {/* Sidebar - Price & Courses */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-4">
              {/* Price */}
              <div className="mb-6 pb-6 border-b border-gray-100">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-red-600">฿2,590.00</span>
                  <span className="text-base text-gray-400 line-through">3,570.00</span>
                </div>
              </div>

              {/* Stats */}
              <div className="mb-6 pb-6 border-b border-gray-100 space-y-3">
                <div className="flex items-center justify-between text-gray-700">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <span className="text-sm">ชั่วโมงการเรียน</span>
                  </div>
                  <span className="font-semibold text-gray-900">{formatDuration(path.estimatedHours)}</span>
                </div>
                <div className="flex items-center justify-between text-gray-700">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-gray-500" />
                    <span className="text-sm">จำนวนคอร์สเรียน</span>
                  </div>
                  <span className="font-semibold text-gray-900">{path.courses.length} คอร์ส</span>
                </div>
              </div>

              {/* Courses List */}
              <div className="mb-6 pb-6 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">คอร์สในเส้นทางการเรียนนี้</h3>
                <div className="space-y-2">
                  {path.courses && path.courses.length > 0 ? (
                    path.courses.map((course) => (
                      <div key={course._id} className="flex items-start gap-2 text-sm">
                        <span className="text-indigo-600 mt-1">✓</span>
                        <span className="text-gray-700">{course.title}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">ไม่มีคอร์สในเส้นทาง</p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold">
                  ซื้อเลยหรือ
                </button>
                <button className="w-full px-6 py-3 border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-semibold flex items-center justify-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  เพิ่มลงตะกร้า
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Courses Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">หลักสูตรในเส้นทาง</h2>

          {path.courses && path.courses.length > 0 ? (
            <div className="flex gap-6">
              {/* Timeline - Sequence Numbers */}
              <div className="flex flex-col items-center flex-shrink-0 pt-2">
                {path.courses.map((_, index) => (
                  <div key={`timeline-${index}`} className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg border-2 border-indigo-300">
                      {index + 1}
                    </div>
                    {index < path.courses.length - 1 && (
                      <div className="w-1 h-16 bg-indigo-300 mt-2 mb-2"></div>
                    )}
                  </div>
                ))}
              </div>

              {/* Courses */}
              <div className="flex-1 space-y-6">
                {path.courses.map((course, index) => (
                  <div
                    key={course._id}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow p-6 flex gap-6"
                    style={{ width: "fit-content" }}
                  >
                    {/* Course Image */}
                    <Link href={`/courses/${course.slug}`} className="flex-shrink-0">
                      <div className="w-56 h-40 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg overflow-hidden flex items-center justify-center hover:scale-105 transition-transform">
                        {course.coverImage ? (
                          <img src={course.coverImage} alt={course.title} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-4xl">📚</span>
                        )}
                      </div>
                    </Link>

                    {/* Course Info */}
                    <div className="w-56 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900 text-base mb-2">{course.title}</h3>

                        {/* Instructor */}
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs">👤</div>
                          <span className="text-xs text-gray-700">{course.instructorName || "ผู้สอน"}</span>
                        </div>

                        {/* Tags/Categories */}
                        <div className="flex flex-wrap gap-1 mb-3">
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Customer Experience & CRM</span>
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Customer Service</span>
                        </div>
                      </div>

                      {/* View Details Link */}
                      <Link href={`/courses/${course.slug}`} className="text-indigo-600 hover:text-indigo-700 font-medium text-sm self-start">
                        ดูรายละเอียด →
                      </Link>
                    </div>

                    {/* Stats - Vertical on Right */}
                    <div className="flex flex-col items-center gap-4 flex-shrink-0 py-2">
                      {course.enrollmentCount !== undefined && (
                        <div className="flex flex-col items-center gap-1 text-sm text-gray-600">
                          <span>👥</span>
                          <span className="font-semibold text-gray-900">{course.enrollmentCount}</span>
                          <span className="text-xs text-gray-500">คน</span>
                        </div>
                      )}

                      {course.duration && (
                        <div className="flex flex-col items-center gap-1 text-sm text-gray-600">
                          <span>⏱️</span>
                          <span className="font-semibold text-gray-900">{course.duration}</span>
                          <span className="text-xs text-gray-500">นาที</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">ยังไม่มีคอร์สในเส้นทางนี้</p>
          )}
        </div>
      </div>
    </div>
  );
}
