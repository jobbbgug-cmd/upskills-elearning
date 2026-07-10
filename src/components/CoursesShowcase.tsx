"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Bookmark } from "lucide-react";

interface Course {
  _id: string;
  title: string;
  coverImage: string;
  instructor: string;
  category: string;
  gradeLevels?: string[];
}

const CATEGORIES = [
  "ทั้งหมด",
  "AI & Automation",
  "การติดตอออนไลน์",
  "ธุรกิจ",
  "การเงิน & สนุน",
  "การพัฒนาแอง",
  "Office Productivity",
  "Data",
  "เตียนโปรแกรม",
  "การพัฒนาตัวเอง",
  "Framework การพัฒนาตัวเอง",
  "โตนิเชอตัวเอง",
  "การออนแบบ",
  "Art & Craft",
  "การเรียน",
  "ศิลปะ & วิทยา",
  "ภาษา",
  "Lifestyles",
  "คณิตศาสตร์",
];

export default function CoursesShowcase() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("ทั้งหมด");
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);

  const itemsPerPage = 4;

  useEffect(() => {
    fetch("/api/courses")
      .then((r) => r.json())
      .then((data) => {
        setCourses(Array.isArray(data.courses) ? data.courses.slice(0, 20) : []);
        setLoading(false);
      })
      .catch(() => {
        setCourses([]);
        setLoading(false);
      });
  }, []);

  const filteredCourses =
    selectedCategory === "ทั้งหมด"
      ? courses
      : courses.filter((c) => c.category === selectedCategory);

  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const paginatedCourses = filteredCourses.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handlePrev = () => {
    setCurrentPage((p) => (p > 0 ? p - 1 : totalPages - 1));
  };

  const handleNext = () => {
    setCurrentPage((p) => (p < totalPages - 1 ? p + 1 : 0));
  };

  if (loading) {
    return (
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-600">กำลังโหลดคอร์ส...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            มากกว่า <span className="text-violet-600">{courses.length}+ หลักสูตร</span> ใน {CATEGORIES.length} หมวดหมู่
            <span className="ml-2">🔥</span>
          </h2>
        </div>

        {/* Category Filter */}
        <div className="mb-12 flex flex-wrap gap-3 justify-center">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setCurrentPage(0);
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? "bg-violet-600 text-white"
                  : "border border-gray-300 text-gray-700 hover:border-violet-400"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* View All Courses Button */}
        <div className="text-center mb-12">
          <Link href="/courses" className="inline-flex items-center gap-2 text-pink-500 hover:text-pink-600 font-semibold transition-colors">
            <span>ดูคอร์สเรียนทั้งหมด</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Courses Carousel */}
        {filteredCourses.length > 0 ? (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {paginatedCourses.map((course) => (
                <div
                  key={course._id}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow group"
                >
                  {/* Course Image */}
                  <div className="relative h-48 bg-gradient-to-br from-indigo-100 to-purple-100 overflow-hidden">
                    {course.coverImage ? (
                      <Image
                        src={course.coverImage}
                        alt={course.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <span className="text-4xl">📚</span>
                      </div>
                    )}
                    <button className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors">
                      <Bookmark className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>

                  {/* Course Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 text-sm mb-3 line-clamp-2">
                      {course.title}
                    </h3>

                    {/* Instructor */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-600">
                        {course.instructor[0]}
                      </div>
                      <span className="text-xs text-gray-600">{course.instructor}</span>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 py-3 border-t border-gray-100">
                      <div className="flex items-center gap-1">
                        <span>👥</span>
                        <span>{Math.floor(Math.random() * 100) + 20}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>⏱️</span>
                        <span>{Math.floor(Math.random() * 50) + 5}h</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>⭐</span>
                        <span>{(Math.random() * 2 + 3).toFixed(1)}</span>
                      </div>
                    </div>

                    {/* CTA */}
                    <Link href={`/courses?category=${encodeURIComponent(course.category)}`}>
                      <button className="w-full py-2.5 bg-violet-600 text-white rounded-xl font-semibold text-sm hover:bg-violet-700 transition-colors">
                        ดูคอร์สเรียนนี้
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-6">
              <button
                onClick={handlePrev}
                disabled={totalPages <= 1}
                className="p-2 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="text-sm text-gray-600 font-medium">
                {String(currentPage + 1).padStart(2, "0")} / {String(totalPages).padStart(2, "0")}
              </div>

              <button
                onClick={handleNext}
                disabled={totalPages <= 1}
                className="p-2 rounded-full border border-violet-400 text-violet-600 hover:bg-violet-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">ไม่พบคอร์สในหมวดหมู่นี้</p>
          </div>
        )}
      </div>
    </section>
  );
}
