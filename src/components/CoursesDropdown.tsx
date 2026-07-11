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
      >
        <div className="flex h-full">
          {/* Left Sidebar Menu */}
          <div className="w-48 border-r border-gray-200 py-4 bg-gray-50">
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
          <div className="flex-1 py-6 px-6 overflow-y-auto">
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
              <div className="space-y-3">
                {latestCourses.length > 0 ? (
                  latestCourses.map((course) => (
                    <Link
                      key={course._id}
                      href={`/courses/${course.slug}`}
                      className="block p-3 bg-gray-50 rounded-lg hover:bg-indigo-50 transition-colors"
                    >
                      <p className="text-sm text-gray-900 font-medium line-clamp-2">{course.title}</p>
                    </Link>
                  ))
                ) : (
                  <p className="text-xs text-gray-500">ยังไม่มีคอร์ส</p>
                )}
              </div>
            ) : activeSection === "learning-paths" ? (
              <div className="space-y-3">
                {learningPaths.length > 0 ? (
                  learningPaths.map((path) => (
                    <Link
                      key={path._id}
                      href={`/learning-paths/${path._id}`}
                      className="block p-3 bg-gray-50 rounded-lg hover:bg-indigo-50 transition-colors"
                    >
                      <p className="text-sm text-gray-900 font-medium line-clamp-2">{path.title}</p>
                    </Link>
                  ))
                ) : (
                  <p className="text-xs text-gray-500">ยังไม่มีเส้นทางการเรียน</p>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
