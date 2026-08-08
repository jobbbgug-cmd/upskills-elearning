"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, Users, BookOpen } from "lucide-react";
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/learning-paths" className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium text-sm">
            <ArrowLeft className="w-4 h-4" />
            กลับไป
          </Link>
        </div>
      </div>

      {/* Cover Image */}
      {path.coverImage && (
        <div className="h-64 bg-gray-200 overflow-hidden">
          <img src={path.coverImage} alt={path.title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{path.title}</h1>
                <p className="text-gray-600">{path.description}</p>
              </div>
              <span className={`${diff.bg} ${diff.text} px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0`}>
                {diff.label}
              </span>
            </div>

            {/* Meta Info */}
            <div className="flex flex-wrap gap-6 text-gray-600 mb-8 pb-8 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>{path.estimatedHours} ชั่วโมง</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                <span>{path.courses.length} คอร์ส</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>{path.instructor}</span>
              </div>
            </div>

            {/* Courses */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">หลักสูตรในเส้นทาง</h2>
              <div className="space-y-4">
                {path.courses && path.courses.length > 0 ? (
                  path.courses.map((course, index) => (
                    <Link
                      key={course._id}
                      href={`/courses/${course.slug}`}
                      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow flex gap-4 p-4"
                    >
                      {/* Course Image */}
                      <div className="w-40 h-32 flex-shrink-0 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg overflow-hidden flex items-center justify-center">
                        {course.coverImage ? (
                          <img src={course.coverImage} alt={course.title} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-3xl">📚</span>
                        )}
                      </div>

                      {/* Course Info */}
                      <div className="flex-1 flex flex-col justify-between py-2">
                        <div>
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <h3 className="font-bold text-gray-900 text-lg line-clamp-2">{course.title}</h3>
                            <span className="text-indigo-600 text-lg flex-shrink-0">→</span>
                          </div>
                          {course.instructorName && (
                            <p className="text-sm text-gray-600 mb-2">{course.instructorName}</p>
                          )}
                          {course.description && (
                            <p className="text-sm text-gray-600 line-clamp-1">{course.description}</p>
                          )}
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                          {course.duration && (
                            <div className="flex items-center gap-1">
                              <span>⏱️</span>
                              <span>{course.duration} นาที</span>
                            </div>
                          )}
                          {course.enrollmentCount !== undefined && (
                            <div className="flex items-center gap-1">
                              <span>👥</span>
                              <span>{course.enrollmentCount} คน</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Number Badge */}
                      <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">ยังไม่มีคอร์สในเส้นทางนี้</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-4">
              <button className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium mb-3">
                เข้าเรียนเส้นทางนี้
              </button>
              <p className="text-xs text-gray-500 text-center">
                ต้องการความช่วยเหลือ?{" "}
                <Link href="/contact" className="text-indigo-600 hover:text-indigo-700">
                  ติดต่อเรา
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
