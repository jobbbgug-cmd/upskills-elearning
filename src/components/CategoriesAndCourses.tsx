"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Clock, User, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

interface Category {
  _id: string;
  name: string;
  type?: string;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  coverImage: string;
  instructor: string;
  sessions?: { startTime?: string; endTime?: string }[];
}

export default function CategoriesAndCourses() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, coursesRes] = await Promise.all([
          fetch("/api/categories?type=online"),
          fetch("/api/courses?type=online&limit=100"),
        ]);
        const categoriesData = await categoriesRes.json();
        const coursesData = await coursesRes.json();

        const cats = categoriesData.categories || [];
        setCategories(cats);
        setCourses(coursesData.courses || []);

        if (cats.length > 0) {
          setSelectedCategory(cats[0]._id);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredCourses = selectedCategory
    ? courses.filter(c => (c as any).categoryName === selectedCategory)
    : courses;

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
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            มากกว่า 400+ คอร์สเรียนออนไลน์ ใน {categories.length} หมวดหมู่
          </h2>
        </div>

        {/* Categories */}
        <div className="mb-12">
          <div className="flex flex-wrap gap-3 justify-center mb-8">
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => setSelectedCategory(cat._id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat._id
                    ? "bg-indigo-600 text-white"
                    : "border border-gray-300 text-gray-700 hover:border-indigo-600 hover:text-indigo-600"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
          <div className="flex justify-center">
            <Link
              href="/courses?type=online"
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium transition-colors cursor-pointer"
            >
              ดูคอร์สทั้งหมด
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-100 rounded-2xl h-96 animate-pulse" />
            ))}
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredCourses.slice(0, 4).map((course) => (
              <Link
                key={course._id}
                href={`/courses/${course._id}`}
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
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                    {course.title}
                  </h3>
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
            <p className="text-gray-500 font-medium">ไม่พบคอร์สในหมวดหมู่นี้</p>
          </div>
        )}
      </div>
    </section>
  );
}
