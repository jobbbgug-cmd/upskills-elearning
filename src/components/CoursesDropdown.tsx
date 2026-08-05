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
    const fetchData = async () => {
      try {
        const [categoriesRes, liveOnlineCategoriesRes, coursesRes, pathsRes] = await Promise.all([
          fetch("/api/categories?type=online"),
          fetch("/api/categories?type=live online"),
          fetch("/api/courses?limit=100"),
          fetch("/api/learning-paths"),
        ]);

        const categoriesData = await categoriesRes.json();
        const liveOnlineCategoriesData = await liveOnlineCategoriesRes.json();
        const coursesData = await coursesRes.json();
        const pathsData = await pathsRes.json();

        const categories = categoriesData.categories || [];
        const liveOnlineCategories = liveOnlineCategoriesData.categories || [];

        const catList = categories.map((cat: any) => cat.name);
        const liveOnlineCatList = liveOnlineCategories.map((cat: any) => cat.name);

        setCategories(catList);
        setLiveOnlineCategories(liveOnlineCatList);
        if (catList.length > 0) setSelectedCategory(catList[0]);

        const allCourses = coursesData.courses || [];
        setLatestCourses(allCourses.slice(0, 3));
        setLearningPaths(pathsData.paths || []);

        // Group courses by category for online
        const courseMap: Record<string, Course[]> = {};
        categories.forEach((cat: any) => {
          courseMap[cat.name] = allCourses.filter((c: Course & { category?: string; type?: string }) => c.category === cat._id && (c.type === "online" || !c.type)).slice(0, 5);
        });
        setCategoryCoursesMap(courseMap);

        // Group courses by category for live online
        const liveOnlineCourseMapData: Record<string, Course[]> = {};
        liveOnlineCategories.forEach((cat: any) => {
          liveOnlineCourseMapData[cat.name] = allCourses.filter((c: Course & { category?: string; type?: string }) => c.category === cat._id && c.type === "live online").slice(0, 5);
        });
        setLiveOnlineCourseMap(liveOnlineCourseMapData);

        // Fetch onsite categories
        const onsiteRes = await fetch("/api/categories?type=onsite");
        const onsiteCategoriesData = await onsiteRes.json();
        const onsiteCats = onsiteCategoriesData.categories || [];
        const onsiteCatList = onsiteCats.map((cat: any) => cat.name);
        
        // Group courses by category for onsite
        const onsiteCourseMapData: Record<string, Course[]> = {};
        onsiteCats.forEach((cat: any) => {
          onsiteCourseMapData[cat.name] = allCourses.filter((c: Course & { category?: string; type?: string }) => c.category === cat._id && c.type === "onsite").slice(0, 5);
        });
        setOnsiteCategories(onsiteCatList);
        setOnsiteCourseMap(onsiteCourseMapData);
        setCategoryCoursesMap(courseMap);
        setLiveOnlineCourseMap(liveOnlineCourseMapData);
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
        style={{ width: "1100px", height: "500px" }}
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
              onClick={() => {
                setActiveSection("courses live");
                setSelectedCategory(null);
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
              onClick={() => setActiveSection("learning-paths")}
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
                setSelectedCategory(null);
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
          <div className="flex-1 py-6 px-6 overflow-y-auto">
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
                      <button
                        key={cat}
                        onClick={() => {
                          setSelectedCategory(cat);
                          setSelectedCourse(null);
                        }}
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
                    <h3 className="text-lg font-bold text-gray-900">คอร์สเรียน</h3>
                    <p className="text-sm text-gray-600 mt-0.5">คอร์สเรียนออนไลน์</p>
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
                      <button
                        key={cat}
                        onClick={() => {
                          setSelectedCategory(cat);
                          setSelectedCourse(null);
                        }}
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
                      <button
                        key={cat}
                        onClick={() => {
                          setSelectedCategory(cat);
                          setSelectedCourse(null);
                        }}
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
                    <p className="text-sm text-gray-600 mt-0.5">ชุดคอร์สเรียนที่จัดเตรียมไว้</p>
                  </div>
                  <Link
                    href="/courses?tab=paths"
                    className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium whitespace-nowrap"
                  >
                    ดูเส้นทางการเรียนทั้งหมด
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

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
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
