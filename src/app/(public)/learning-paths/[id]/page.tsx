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
                      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow flex items-start gap-4"
                    >
                      <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">{course.title}</h3>
                        {course.instructorName && (
                          <p className="text-sm text-gray-600">{course.instructorName}</p>
                        )}
                      </div>
                      <span className="text-indigo-600 text-sm font-medium">→</span>
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
