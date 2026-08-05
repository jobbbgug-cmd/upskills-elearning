"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Clock, User, ArrowRight } from "lucide-react";

interface Course {
  _id: string;
  title: string;
  slug?: string;
  description: string;
  coverImage: string;
  instructor: string;
  sessions?: { startTime?: string; endTime?: string }[];
}

export default function CoursesShowcase() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch("/api/courses?limit=3");
        const data = await res.json();
        setCourses(data.courses || []);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const getDuration = (sessions?: { startTime?: string; endTime?: string }[]) => {
    if (!sessions || sessions.length === 0) return "เรียนตามแผน";
    const session = sessions[0];
    if (session.startTime && session.endTime) {
      return `${session.startTime} - ${session.endTime}`;
    }
    return "เรียนตามแผน";
  };

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">คอร์สเรียนใหม่</h2>
            <p className="text-gray-600">คอร์สเรียนที่อัปเดตล่าสุด</p>
          </div>
          <Link
            href="/courses?sort=newest"
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
          >
            ดูคอร์สเรียนใหม่ทั้งหมด
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-100 rounded-2xl h-96 animate-pulse" />
            ))}
          </div>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Link
                key={course._id}
                href={`/courses/${course.slug || course._id}`}
                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all"
              >
                {/* Cover Image */}
                <div className="relative h-40 bg-gray-200 overflow-hidden">
                  {course.coverImage ? (
                    <Image
                      src={course.coverImage}
                      alt={course.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center">
                      <span className="text-4xl">📚</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  {/* Title */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                    {course.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 leading-relaxed mb-4 line-clamp-2">
                    {course.description}
                  </p>

                  {/* Meta Info */}
                  <div className="space-y-2 mb-4 border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Clock className="w-4 h-4 text-indigo-500" />
                      <span>{getDuration(course.sessions)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <User className="w-4 h-4 text-indigo-500" />
                      <span>{course.instructor}</span>
                    </div>
                  </div>

                  {/* Button */}
                  <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors">
                    ดูคอร์สเรียน
                  </button>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">ยังไม่มีคอร์สเรียน</p>
          </div>
        )}
      </div>
    </section>
  );
}
