"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronDown, ChevronRight, Clock, User } from "lucide-react";
import { useState, useEffect } from "react";

interface Course {
  _id: string;
  title: string;
  slug: string;
  coverImage?: string;
  description?: string;
  instructor?: string;
  sessions?: { startTime?: string; endTime?: string }[];
}


interface LearningPath {
  _id: string;
  title: string;
  description?: string;
  coverImage?: string;
  instructor?: string;
  courses?: any[];
  estimatedHours?: number;
  price?: number;
  discount?: number;
  discountType?: "percentage" | "fixed";
}

type MenuSection = "courses" | "courses live" | "new-courses" | "learning-paths" | "onsite";

export default function CoursesDropdown() {
  const [activeSection, setActiveSection] = useState<MenuSection>("courses");
  const [categories, setCategories] = useState<string[]>([]);
  const [liveOnlineCategories, setLiveOnlineCategories] = useState<string[]>([]);
  const [latestCourses, setLatestCourses] = useState<Course[]>([]);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [categoryCoursesMap, setCategoryCoursesMap] = useState<Record<string, Course[]>>({});
  const [liveOnlineCourseMap, setLiveOnlineCourseMap] = useState<Record<string, Course[]>>({});
  const [onsiteCategories, setOnsiteCategories] = useState<string[]>([]);
  const [onsiteCourseMap, setOnsiteCourseMap] = useState<Record<string, Course[]>>({});
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      try {
        const [categoriesRes, liveOnlineCategoriesRes, coursesRes, pathsRes, onsiteRes] = await Promise.all([
          fetch("/api/categories?type=online", { signal: controller.signal }),
          fetch("/api/categories?type=live%20online", { signal: controller.signal }),
          fetch("/api/courses?limit=100", { signal: controller.signal }),
          fetch("/api/learning-paths", { signal: controller.signal }),
          fetch("/api/categories?type=onsite", { signal: controller.signal }),
        ]);

        if (!categoriesRes.ok || !liveOnlineCategoriesRes.ok || !coursesRes.ok || !pathsRes.ok || !onsiteRes.ok) {
          throw new Error("API response error");
        }

        const [categoriesData, liveOnlineCategoriesData, coursesData, pathsData, onsiteCategoriesData] = await Promise.all([
          categoriesRes.json(),
          liveOnlineCategoriesRes.json(),
          coursesRes.json(),
          pathsRes.json(),
          onsiteRes.json(),
        ]);

        if (!isMounted) return;

        const categories = categoriesData.categories || [];
        const liveOnlineCategories = liveOnlineCategoriesData.categories || [];
        const allCourses = coursesData.courses || [];
        const onsiteCats = onsiteCategoriesData.categories || [];

        const catList = categories.map((cat: any) => cat.name);
        const liveOnlineCatList = liveOnlineCategories.map((cat: any) => cat.name);
        const onsiteCatList = onsiteCats.map((cat: any) => cat.name);

        setCategories(catList);
        setLiveOnlineCategories(liveOnlineCatList);
        setOnsiteCategories(onsiteCatList);
        if (catList.length > 0) setSelectedCategory(catList[0]);

        const onlineCourses = allCourses.filter((c: Course & { type?: string }) => c.type === "online" || !c.type);
        setLatestCourses(onlineCourses.slice(0, 3));
        setLearningPaths(pathsData.paths || []);

        // Group courses by category
        const courseMap: Record<string, Course[]> = {};
        categories.forEach((cat: any) => {
          courseMap[cat.name] = allCourses.filter((c: Course & { category?: string; type?: string }) => c.category === cat._id && (c.type === "online" || !c.type)).slice(0, 5);
        });
        setCategoryCoursesMap(courseMap);

        const liveOnlineCourseMapData: Record<string, Course[]> = {};
        liveOnlineCategories.forEach((cat: any) => {
          liveOnlineCourseMapData[cat.name] = allCourses.filter((c: Course & { category?: string; type?: string }) => c.category === cat._id && c.type === "live online").slice(0, 5);
        });
        setLiveOnlineCourseMap(liveOnlineCourseMapData);

        const onsiteCourseMapData: Record<string, Course[]> = {};
        onsiteCats.forEach((cat: any) => {
          onsiteCourseMapData[cat.name] = allCourses.filter((c: Course & { category?: string; type?: string }) => c.category === cat._id && c.type === "onsite").slice(0, 5);
        });
        setOnsiteCourseMap(onsiteCourseMapData);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Failed to fetch dropdown data:", error);
        }
      } finally {
        clearTimeout(timeoutId);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
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
        style={{ width: "1100px", height: "500px" }}
      >
        <div className="flex h-full">
          {/* Left Sidebar Menu */}
          <div className="w-48 border-r border-gray-200 py-4 bg-gray-50 overflow-y-auto">
            <button
              onClick={() => {
                setActiveSection("courses");
                if (categories.length > 0) {
                  setSelectedCategory(categories[0]);
                  setSelectedCourse(categoryCoursesMap[categories[0]]?.[0] || null);
                } else {
                  setSelectedCategory(null);
                  setSelectedCourse(null);
                }
              }}
              className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors ${
                activeSection === "courses"
                  ? "bg-indigo-50 text-indigo-600 border-r-2 border-indigo-600"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="flex items-center justify-between">
                คอร์สเรียนออนไลน์
                {activeSection === "courses" && <ChevronRight className="w-4 h-4" />}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveSection("courses live");
                if (liveOnlineCategories.length > 0) {
                  setSelectedCategory(liveOnlineCategories[0]);
                  setSelectedCourse(liveOnlineCourseMap[liveOnlineCategories[0]]?.[0] || null);
                } else {
                  setSelectedCategory(null);
                  setSelectedCourse(null);
                }
              }}
              className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors ${
                activeSection === "courses live"
                  ? "bg-indigo-50 text-indigo-600 border-r-2 border-indigo-600"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="flex items-center justify-between">
                คอร์สเรียน Live
                {activeSection === "courses live" && <ChevronRight className="w-4 h-4" />}
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
              onClick={() => {
                setActiveSection("learning-paths");
                if (learningPaths.length > 0) {
                  setSelectedCourse(learningPaths[0] as any);
                } else {
                  setSelectedCourse(null);
                }
              }}
              className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors ${
                activeSection === "learning-paths"
                  ? "bg-indigo-50 text-indigo-600 border-r-2 border-indigo-600"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="flex items-center justify-between">
                เส้นทางการเรียน
                {activeSection === "learning-paths" && <ChevronRight className="w-4 h-4" />}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveSection("onsite");
                if (onsiteCategories.length > 0) {
                  setSelectedCategory(onsiteCategories[0]);
                  setSelectedCourse(onsiteCourseMap[onsiteCategories[0]]?.[0] || null);
                } else {
                  setSelectedCategory(null);
                  setSelectedCourse(null);
                }
              }}
              className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors ${
                activeSection === "onsite"
                  ? "bg-indigo-50 text-indigo-600 border-r-2 border-indigo-600"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="flex items-center justify-between">
                หลักสูตร Onsite
                {activeSection === "onsite" && <ChevronRight className="w-4 h-4" />}
              </span>
            </button>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 py-6 px-6 overflow-y-auto" onWheel={(e) => e.stopPropagation()}>
            {loading ? (
              <p className="text-gray-500 text-center py-12">กำลังโหลด...</p>
            ) : activeSection === "courses live" ? (
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">คอร์สเรียน Live</h3>
                    <p className="text-sm text-gray-600 mt-0.5">คอร์สเรียนออนไลน์แบบสด</p>
                  </div>
                  <Link
                    href="/courses?tab=live-online"
                    className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium whitespace-nowrap"
                  >
                    ดูคอร์สเรียน Live ทั้งหมด
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="flex gap-4 h-full">
                  {/* Left: Live Online Categories List */}
                  <div className="w-56 border-r border-gray-200 pr-4 space-y-2 overflow-y-auto">
                    {liveOnlineCategories.map((cat) => (
                      <Link
                        key={cat}
                        href={`/courses?tab=live-online&category=${encodeURIComponent(cat)}`}
                        className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors block ${
                          selectedCategory === cat
                            ? "bg-indigo-50 text-indigo-600 font-medium"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {cat}
                      </Link>
                    ))}
                  </div>

                  {/* Middle: Course List */}
                  <div className="w-72 border-r border-gray-200 pr-4 space-y-2 overflow-y-auto">
                    {selectedCategory && (liveOnlineCourseMap[selectedCategory] || []).length > 0 ? (
                      (liveOnlineCourseMap[selectedCategory] || []).map((course) => (
                        <button
                          key={course._id}
                          onClick={() => setSelectedCourse(course)}
                          className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors line-clamp-2 ${
                            selectedCourse?._id === course._id
                              ? "bg-indigo-50 text-indigo-600 font-medium"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {course.title}
                        </button>
                      ))
                    ) : selectedCategory ? (
                      <p className="text-xs text-gray-500">ไม่มีคอร์ส</p>
                    ) : (
                      <p className="text-xs text-gray-500">เลือกหมวดหมู่</p>
                    )}
                  </div>

                  {/* Right: Selected Course Card */}
                  <div className="flex-1 p-4 overflow-y-auto flex items-start justify-center pt-4">
                    {selectedCourse ? (
                      <div className="w-full bg-white rounded-lg border border-gray-200 overflow-hidden">
                        {/* Cover Image */}
                        <div className="relative h-32 bg-gray-200 overflow-hidden">
                          {selectedCourse.coverImage ? (
                            <Image
                              src={selectedCourse.coverImage}
                              alt={selectedCourse.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center">
                              <span className="text-4xl">📚</span>
                            </div>
                          )}
                        </div>
                        {/* Content */}
                        <div className="p-4">
                          <h3 className="text-xs font-bold text-gray-900 mb-2 line-clamp-2">{selectedCourse.title}</h3>
                          {selectedCourse.description && (
                            <p className="text-xs text-gray-600 mb-3 line-clamp-2">{selectedCourse.description}</p>
                          )}
                          {selectedCourse.instructor && (
                            <p className="text-xs text-gray-700 mb-3"><strong>สอน:</strong> {selectedCourse.instructor}</p>
                          )}
                          <Link
                            href={`/courses/${selectedCourse._id}?tab=live-online`}
                            className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-xs font-medium transition-colors"
                          >
                            ดูรายละเอียด
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500">เลือกคอร์สเพื่อดูรายละเอียด</p>
                    )}
                  </div>
                </div>
              </div>
            ) : activeSection === "courses" ? (
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">คอร์สเรียนออนไลน์</h3>
                    <p className="text-sm text-gray-600 mt-0.5">คอร์สเรียนออนไลน์สอนผ่านVDO</p>
                  </div>
                  <Link
                    href="/courses?tab=online"
                    className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium whitespace-nowrap"
                  >
                    ดูคอร์สเรียนทั้งหมด
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="flex gap-4 h-full">
                  {/* Left: Categories List */}
                  <div className="w-56 border-r border-gray-200 pr-4 space-y-2 overflow-y-auto">
                    {categories.map((cat) => (
                      <Link
                        key={cat}
                        href={`/courses?tab=online&category=${encodeURIComponent(cat)}`}
                        className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors block ${
                          selectedCategory === cat
                            ? "bg-indigo-50 text-indigo-600 font-medium"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {cat}
                      </Link>
                    ))}
                  </div>

                  {/* Middle: Course List */}
                  <div className="w-64 border-r border-gray-200 pr-4 space-y-2 overflow-y-auto">
                    {selectedCategory && (categoryCoursesMap[selectedCategory] || []).length > 0 ? (
                      (categoryCoursesMap[selectedCategory] || []).map((course) => (
                        <button
                          key={course._id}
                          onClick={() => setSelectedCourse(course)}
                          className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors line-clamp-2 ${
                            selectedCourse?._id === course._id
                              ? "bg-indigo-50 text-indigo-600 font-medium"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {course.title}
                        </button>
                      ))
                    ) : selectedCategory ? (
                      <p className="text-xs text-gray-500">ไม่มีคอร์ส</p>
                    ) : (
                      <p className="text-xs text-gray-500">เลือกหมวดหมู่</p>
                    )}
                  </div>

                  {/* Right: Selected Course Card */}
                  <div className="flex-1 p-4 overflow-y-auto flex items-start justify-center pt-4">
                    {selectedCourse ? (
                      <div className="w-full bg-white rounded-lg border border-gray-200 overflow-hidden">
                        {/* Cover Image */}
                        <div className="relative h-32 bg-gray-200 overflow-hidden">
                          {selectedCourse.coverImage ? (
                            <Image
                              src={selectedCourse.coverImage}
                              alt={selectedCourse.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center">
                              <span className="text-4xl">📚</span>
                            </div>
                          )}
                        </div>
                        {/* Content */}
                        <div className="p-4">
                          <h3 className="text-xs font-bold text-gray-900 mb-2 line-clamp-2">{selectedCourse.title}</h3>
                          {selectedCourse.description && (
                            <p className="text-xs text-gray-600 mb-3 line-clamp-2">{selectedCourse.description}</p>
                          )}
                          {selectedCourse.instructor && (
                            <p className="text-xs text-gray-700 mb-3"><strong>สอน:</strong> {selectedCourse.instructor}</p>
                          )}
                          <Link
                            href={`/courses/${selectedCourse._id}?tab=online`}
                            className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-xs font-medium transition-colors"
                          >
                            ดูรายละเอียด
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500">เลือกคอร์สเพื่อดูรายละเอียด</p>
                    )}
                  </div>
                </div>
              </div>
            ) : activeSection === "new-courses" ? (
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">คอร์สเรียนใหม่</h3>
                    <p className="text-sm text-gray-600 mt-0.5">คอร์สเรียนที่อัปเดตล่าสุด</p>
                  </div>
                  <Link
                    href="/courses?tab=all&sort=newest"
                    className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium whitespace-nowrap"
                  >
                    ดูคอร์สเรียนใหม่ทั้งหมด
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-3 gap-4">
                  {latestCourses.length > 0 ? (
                  latestCourses.map((course) => (
                    <Link
                      key={course._id}
                      href={`/courses/${course._id}`}
                      className="group bg-gray-50 rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-all"
                    >
                      {/* Cover Image */}
                      <div className="relative h-24 bg-gray-200 overflow-hidden">
                        {course.coverImage ? (
                          <Image
                            src={course.coverImage}
                            alt={course.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center">
                            <span className="text-2xl">📚</span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-3">
                        <h4 className="text-sm font-bold text-gray-900 line-clamp-2 group-hover:text-indigo-600 mb-2">
                          {course.title}
                        </h4>
                        {course.sessions && course.sessions.length > 0 && (
                          <div className="text-xs text-gray-600 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-indigo-500" />
                            {course.sessions[0].startTime} - {course.sessions[0].endTime}
                          </div>
                        )}
                        {course.instructor && (
                          <div className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                            <User className="w-3 h-3 text-indigo-500" />
                            {course.instructor}
                          </div>
                        )}
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 col-span-2 py-8 text-center">ยังไม่มีคอร์ส</p>
                )}
                </div>
              </div>
            ) : activeSection === "onsite" ? (
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">หลักสูตร Onsite</h3>
                    <p className="text-sm text-gray-600 mt-0.5">คอร์สเรียนที่สอนในสถาบัน</p>
                  </div>
                  <Link
                    href="/courses?tab=onsite"
                    className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium whitespace-nowrap"
                  >
                    ดูหลักสูตร Onsite ทั้งหมด
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="flex gap-4 h-full">
                  {/* Left: Onsite Categories List */}
                  <div className="w-56 border-r border-gray-200 pr-4 space-y-2 overflow-y-auto">
                    {onsiteCategories.map((cat) => (
                      <Link
                        key={cat}
                        href={`/courses?tab=onsite&category=${encodeURIComponent(cat)}`}
                        className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors block ${
                          selectedCategory === cat
                            ? "bg-indigo-50 text-indigo-600 font-medium"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {cat}
                      </Link>
                    ))}
                  </div>

                  {/* Middle: Course List */}
                  <div className="w-72 border-r border-gray-200 pr-4 space-y-2 overflow-y-auto">
                    {selectedCategory && (onsiteCourseMap[selectedCategory] || []).length > 0 ? (
                      (onsiteCourseMap[selectedCategory] || []).map((course) => (
                        <button
                          key={course._id}
                          onClick={() => setSelectedCourse(course)}
                          className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors line-clamp-2 ${
                            selectedCourse?._id === course._id
                              ? "bg-indigo-50 text-indigo-600 font-medium"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {course.title}
                        </button>
                      ))
                    ) : selectedCategory ? (
                      <p className="text-xs text-gray-500">ไม่มีคอร์ส</p>
                    ) : (
                      <p className="text-xs text-gray-500">เลือกหมวดหมู่</p>
                    )}
                  </div>

                  {/* Right: Selected Course Card */}
                  <div className="flex-1 p-4 overflow-y-auto flex items-start justify-center pt-4">
                    {selectedCourse ? (
                      <div className="w-full bg-white rounded-lg border border-gray-200 overflow-hidden">
                        {/* Cover Image */}
                        <div className="relative h-32 bg-gray-200 overflow-hidden">
                          {selectedCourse.coverImage ? (
                            <Image
                              src={selectedCourse.coverImage}
                              alt={selectedCourse.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center">
                              <span className="text-4xl">📚</span>
                            </div>
                          )}
                        </div>
                        {/* Content */}
                        <div className="p-4">
                          <h3 className="text-xs font-bold text-gray-900 mb-2 line-clamp-2">{selectedCourse.title}</h3>
                          {selectedCourse.description && (
                            <p className="text-xs text-gray-600 mb-3 line-clamp-2">{selectedCourse.description}</p>
                          )}
                          {selectedCourse.instructor && (
                            <p className="text-xs text-gray-700 mb-3"><strong>สอน:</strong> {selectedCourse.instructor}</p>
                          )}
                          <Link
                            href={`/courses/${selectedCourse._id}?tab=onsite`}
                            className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-xs font-medium transition-colors"
                          >
                            ดูรายละเอียด
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500">เลือกคอร์สเพื่อดูรายละเอียด</p>
                    )}
                  </div>
                </div>
              </div>
            ) : activeSection === "learning-paths" ? (
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">เส้นทางการเรียน</h3>
                    <p className="text-sm text-gray-600 mt-0.5">หลักสูตรที่ออกแบบมาเพื่อคุณ</p>
                  </div>
                  <Link
                    href="/courses?tab=paths"
                    className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium whitespace-nowrap"
                  >
                    ดูเส้นทางการเรียนทั้งหมด
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="flex gap-4 h-full">
                {/* Left: Learning Paths List */}
                <div className="w-56 border-r border-gray-200 pr-4 space-y-2 overflow-y-auto">
                  {learningPaths.length > 0 ? (
                    learningPaths.map((path) => (
                      <button
                        key={path._id}
                        onClick={() => setSelectedCourse(path as any)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          (selectedCourse as any)?._id === path._id
                            ? "bg-indigo-50 text-indigo-600 font-medium"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <p className="text-sm line-clamp-2">{path.title}</p>
                      </button>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500">ยังไม่มีเส้นทางการเรียน</p>
                  )}
                </div>

                {/* Right: Courses in Learning Path */}
                <div className="flex-1 pl-4">
                  {(selectedCourse as any)?._id ? (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4">{(selectedCourse as any).title}</h3>
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {(selectedCourse as any).courses && (selectedCourse as any).courses.length > 0 ? (
                          (selectedCourse as any).courses.map((course: any, idx: number) => (
                            <div key={idx} className="flex gap-3 p-3 bg-gray-50 rounded-lg hover:bg-indigo-50 transition-colors">
                              {/* Course Cover Image */}
                              <div className="flex-shrink-0 w-48 h-28 bg-gray-200 rounded-lg overflow-hidden">
                                {typeof course === 'object' && course.coverImage ? (
                                  <Image
                                    src={course.coverImage}
                                    alt={course.title || 'Course'}
                                    width={192}
                                    height={112}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center">
                                    <span className="text-2xl">📚</span>
                                  </div>
                                )}
                              </div>

                              {/* Course Info */}
                              <div className="flex-1">
                                <h4 className="text-sm font-bold text-gray-900 line-clamp-2 mb-2">
                                  {typeof course === 'object' ? course.title : course}
                                </h4>
                                <div className="space-y-1 text-xs text-gray-600">
                                  {typeof course === 'object' && course.lessons && Array.isArray(course.lessons) && course.lessons.length > 0 && (
                                    <div className="flex items-center gap-1">
                                      <span>📖</span>
                                      <span>{course.lessons.length} บท</span>
                                    </div>
                                  )}
                                  {typeof course === 'object' && course.duration && course.duration > 0 && (
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      <span>{course.duration} นาที</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">ไม่มีคอร์สเรียนในเส้นทางนี้</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-12">เลือกเส้นทางการเรียนเพื่อดูคอร์สเรียน</p>
                  )}
                </div>
              </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
