"use client";

import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

interface Course {
  _id: string;
  title: string;
  slug: string;
}

interface Category {
  name: string;
  count: number;
}

interface LearningPath {
  _id: string;
  title: string;
}

type MenuSection = "courses" | "new-courses" | "learning-paths";

export default function CoursesDropdown() {
  const [activeSection, setActiveSection] = useState<MenuSection>("courses");
  const [categories, setCategories] = useState<string[]>([]);
  const [latestCourses, setLatestCourses] = useState<Course[]>([]);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [categoryCoursesMap, setCategoryCoursesMap] = useState<Record<string, Course[]>>({});
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, coursesRes, pathsRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/courses?limit=100"),
          fetch("/api/learning-paths"),
        ]);

        const categoriesData = await categoriesRes.json();
        const coursesData = await coursesRes.json();
        const pathsData = await pathsRes.json();

        const catList = (categoriesData.categories || []).map((cat: Category) => cat.name);
        setCategories(catList);
        if (catList.length > 0) setSelectedCategory(catList[0]);

        const allCourses = coursesData.courses || [];
        setLatestCourses(allCourses.slice(0, 3));
        setLearningPaths(pathsData.paths || []);

        // Group courses by category
        const courseMap: Record<string, Course[]> = {};
        catList.forEach((cat: string) => {
          courseMap[cat] = allCourses.filter((c: Course & { category?: string }) => c.category === cat).slice(0, 5);
        });
        setCategoryCoursesMap(courseMap);
      } catch (error) {
        console.error("Failed to fetch dropdown data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="relative group">
      <button className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-indigo-600 py-3">
        คอร์สออนไลน์
        <ChevronDown className="w-4 h-4" />
      </button>

      {/* Mega Menu - 2 Columns */}
      <div
        className="absolute left-0 top-full hidden group-hover:block bg-white border border-gray-200 rounded-lg shadow-2xl z-50"
        style={{ width: "800px", height: "500px" }}
        onWheel={(e) => e.stopPropagation()}
      >
        <div className="flex h-full">
          {/* Left Sidebar Menu */}
          <div className="w-48 border-r border-gray-200 py-4 bg-gray-50 overflow-y-auto">
            <button
              onClick={() => {
                setActiveSection("courses");
                setSelectedCategory(null);
              }}
              className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors ${
                activeSection === "courses"
                  ? "bg-indigo-50 text-indigo-600 border-r-2 border-indigo-600"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="flex items-center justify-between">
                คอร์สเรียน
                {activeSection === "courses" && <ChevronRight className="w-4 h-4" />}
              </span>
            </button>

            <button
              onClick={() => setActiveSection("new-courses")}
              className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors ${
                activeSection === "new-courses"
                  ? "bg-indigo-50 text-indigo-600 border-r-2 border-indigo-600"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="flex items-center justify-between">
                คอร์สเรียนใหม่
                {activeSection === "new-courses" && <ChevronRight className="w-4 h-4" />}
              </span>
            </button>

            <button
              onClick={() => setActiveSection("learning-paths")}
              className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors ${
                activeSection === "learning-paths"
                  ? "bg-indigo-50 text-indigo-600 border-r-2 border-indigo-600"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="flex items-center justify-between">
                เส้นทางการเรียนใหม่
                {activeSection === "learning-paths" && <ChevronRight className="w-4 h-4" />}
              </span>
            </button>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 py-6 px-6 overflow-y-auto" onWheel={(e) => e.stopPropagation()}>
            {loading ? (
              <p className="text-gray-500 text-center py-12">กำลังโหลด...</p>
            ) : activeSection === "courses" ? (
              <div className="flex gap-4 h-full">
                {/* Left: Categories List */}
                <div className="w-40 border-r border-gray-200 pr-4 space-y-2 overflow-y-auto">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                        selectedCategory === cat
                          ? "bg-indigo-50 text-indigo-600 font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Right: Courses in Selected Category */}
                <div className="flex-1 space-y-3 overflow-y-auto">
                  {selectedCategory && (categoryCoursesMap[selectedCategory] || []).length > 0 ? (
                    (categoryCoursesMap[selectedCategory] || []).map((course) => (
                      <Link
                        key={course._id}
                        href={`/courses/${course.slug}`}
                        className="block p-3 bg-gray-50 rounded-lg hover:bg-indigo-50 transition-colors"
                      >
                        <p className="text-sm text-gray-900 font-medium line-clamp-2">{course.title}</p>
                      </Link>
                    ))
                  ) : selectedCategory ? (
                    <p className="text-xs text-gray-500">ไม่มีคอร์สในหมวดนี้</p>
                  ) : (
                    <p className="text-xs text-gray-500">เลือกหมวดหมู่เพื่อดูคอร์ส</p>
                  )}
                </div>
              </div>
            ) : activeSection === "new-courses" ? (
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                  <h4 className="font-semibold text-gray-900 text-sm">คอร์สเรียนใหม่ UPSkills</h4>
                  <Link href="/courses?sort=-createdAt" className="text-indigo-600 hover:text-indigo-700 text-xs font-medium">
                    ดูคอร์สเรียนใหม่ทั้งหมด →
                  </Link>
                </div>
                <div className="grid grid-cols-3 gap-3">
                {latestCourses.length > 0 ? (
                  latestCourses.slice(0, 3).map((course) => (
                    <Link
                      key={course._id}
                      href={`/courses/${course.slug || course._id}`}
                      className="rounded-lg overflow-hidden transition-all group hover:bg-gray-100 p-1"
                    >
                      {/* Card Inner */}
                      <div className="rounded-lg overflow-hidden bg-white">
                        {/* Image */}
                        <div className="relative h-28 bg-gradient-to-br from-indigo-100 to-purple-100 overflow-hidden">
                          {course.coverImage ? (
                            <img
                              src={course.coverImage}
                              alt={course.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-2xl">📚</div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="p-2">
                          <h4 className="font-semibold text-gray-900 text-xs mb-1 line-clamp-2">
                            {course.title}
                          </h4>
                          <p className="text-xs text-gray-600 mb-2">{course.instructor}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>⏱️ {course.duration || 0}h</span>
                            <span>⭐ {(course.averageRating || 0).toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 col-span-3 text-center py-4">ยังไม่มีคอร์ส</p>
                )}
                </div>
              </div>
            ) : activeSection === "learning-paths" ? (
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                  <h4 className="font-semibold text-gray-900 text-sm">เส้นทางการเรียนใหม่ UPSkills</h4>
                  <Link href="/learning-paths" className="text-indigo-600 hover:text-indigo-700 text-xs font-medium">
                    ดูเส้นทางการเรียนทั้งหมด →
                  </Link>
                </div>
                <div className="grid grid-cols-3 gap-3">
                {learningPaths.length > 0 ? (
                  learningPaths.slice(0, 3).map((path) => (
                    <Link
                      key={path._id}
                      href={`/learning-paths/${path._id}`}
                      className="rounded-lg overflow-hidden transition-all group hover:bg-gray-100 p-1"
                    >
                      {/* Card Inner */}
                      <div className="rounded-lg overflow-hidden bg-white">
                        {/* Image */}
                        <div className="relative h-28 bg-gradient-to-br from-emerald-100 to-teal-100 overflow-hidden">
                          {(path as any).coverImage ? (
                            <img
                              src={(path as any).coverImage}
                              alt={path.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-2xl">🎯</div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="p-2">
                          <h4 className="font-semibold text-gray-900 text-xs mb-1 line-clamp-2">
                            {path.title}
                          </h4>
                          <p className="text-xs text-gray-600 mb-2">เส้นทางการเรียน</p>
                          <div className="text-xs text-indigo-600 font-medium">
                            ดูเส้นทาง →
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 col-span-3 text-center py-4">ยังไม่มีเส้นทาง</p>
                )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
