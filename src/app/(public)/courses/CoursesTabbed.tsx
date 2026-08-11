"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { ICourse } from "@/types";
import Toast from "@/components/ui/Toast";
import { useCart } from "@/context/CartContext";

interface Category {
  name: string;
  count: number;
}

interface LearningPath {
  _id: string;
  title: string;
  description: string;
  coverImage?: string;
  instructor: string;
  difficulty: string;
  courses: any[];
  estimatedHours?: number;
  price?: number;
  discount?: number;
  discountType?: "percentage" | "fixed";
}

type TabType = "all" | "online" | "live-online" | "paths" | "onsite";

const formatDuration = (hours: number): string => {
  if (hours === 0) return "0 น.";

  const totalMinutes = Math.round(hours * 60);

  if (totalMinutes < 60) {
    return `${totalMinutes} น.`;
  } else {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h}.${m.toString().padStart(2, '0')} ชม.`;
  }
};

interface CourseTabbedProps {
  courses: (ICourse & { categoryName?: string })[];
}

export default function CoursesTabbed({ courses }: CourseTabbedProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToCart } = useCart();
  
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [categories, setCategories] = useState<Category[]>([]);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [currentPage, setCurrentPage] = useState<Record<string, number>>({
    online: 1,
    "live-online": 1,
    paths: 1,
    onsite: 1,
  });
  const [selectedDifficulties, setSelectedDifficulties] = useState<Set<string>>(new Set());
  const [selectedDurations, setSelectedDurations] = useState<Set<string>>(new Set());

  // Sync with URL params after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const tab = searchParams.get("tab");
    const category = searchParams.get("category");

    if (tab === "all" || tab === "online" || tab === "live-online" || tab === "paths" || tab === "onsite") {
      setActiveTab(tab as TabType);
    } else {
      setActiveTab("all");
    }
    if (category) {
      setSelectedCategory(category);
    }
  }, [searchParams, mounted]);

  // Fetch learning paths on mount
  useEffect(() => {
    const fetchLearningPaths = async () => {
      try {
        const res = await fetch("/api/learning-paths");
        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }
        const data = await res.json();
        setLearningPaths(data.paths || []);
      } catch (error) {
        console.error("Failed to fetch learning paths:", error);
      }
    };
    fetchLearningPaths();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingCategories(true);
      try {
        if (activeTab === "paths") {
          setCategories([]);
        } else {
          let apiUrl = "/api/categories";
          if (activeTab === "online") apiUrl = "/api/categories?type=online";
          else if (activeTab === "live-online") apiUrl = "/api/categories?type=live%20online";
          else if (activeTab === "onsite") apiUrl = "/api/categories?type=onsite";

          const res = await fetch(apiUrl);
          if (!res.ok) {
            throw new Error(`API error: ${res.status}`);
          }
          const data = await res.json();
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchData();
  }, [activeTab]);

  const handleAddToCart = (course: ICourse | LearningPath) => {
    addToCart(course as ICourse);
    setToast({ message: "เพิ่มลงตะกร้าแล้ว!", type: "success" });
    setTimeout(() => setToast(null), 3000);
  };

  const tabs = [
    { id: "all", label: "ทั้งหมด", count: courses.length + learningPaths.length },
    { id: "online", label: "คอร์สเรียน", count: courses.filter((c) => (c.type || "online") === "online").length },
    { id: "live-online", label: "คอร์สเรียน Live", count: courses.filter((c) => c.type === "live online").length },
    { id: "paths", label: "เส้นทางการเรียน", count: learningPaths.length },
    { id: "onsite", label: "คอร์สเรียน Onsite", count: courses.filter((c) => c.type === "onsite").length },
  ] as const;

  const filteredLearningPaths = learningPaths.filter((path) => {
    // Difficulty filter
    if (selectedDifficulties.size > 0) {
      if (!selectedDifficulties.has(path.difficulty || "medium")) {
        return false;
      }
    }

    // Duration filter (convert estimated hours to minutes for comparison)
    if (selectedDurations.size > 0) {
      let durationMatches = false;
      const durationMinutes = (path.estimatedHours || 0) * 60;

      if (selectedDurations.has("0-60") && durationMinutes >= 0 && durationMinutes <= 60) durationMatches = true;
      if (selectedDurations.has("60-120") && durationMinutes > 60 && durationMinutes <= 120) durationMatches = true;
      if (selectedDurations.has("120-240") && durationMinutes > 120 && durationMinutes <= 240) durationMatches = true;
      if (selectedDurations.has("240+") && durationMinutes > 240) durationMatches = true;

      if (!durationMatches) return false;
    }

    return true;
  });

  const filteredCourses = courses.filter((c) => {
    if (activeTab === "paths") {
      return false;
    }

    // Difficulty filter
    if (selectedDifficulties.size > 0) {
      if (!selectedDifficulties.has((c as any).difficulty || "medium")) {
        return false;
      }
    }

    // Duration filter (duration is in minutes)
    if (selectedDurations.size > 0) {
      let durationMatches = false;
      const duration = c.duration || 0;

      if (selectedDurations.has("0-60") && duration >= 0 && duration <= 60) durationMatches = true;
      if (selectedDurations.has("60-120") && duration > 60 && duration <= 120) durationMatches = true;
      if (selectedDurations.has("120-240") && duration > 120 && duration <= 240) durationMatches = true;
      if (selectedDurations.has("240+") && duration > 240) durationMatches = true;

      if (!durationMatches) return false;
    }

    // Category filter
    if (selectedCategory) {
      if (!((c as any).categoryName && (c as any).categoryName.toLowerCase() === selectedCategory.toLowerCase())) {
        return false;
      }
    }

    // Type filter
    if (activeTab === "all") {
      return true;
    }

    const typeMatches =
      (activeTab === "online" && (c.type || "online") === "online") ||
      (activeTab === "live-online" && c.type === "live online") ||
      (activeTab === "onsite" && c.type === "onsite");

    return typeMatches;
  });

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
          <h3 className="font-bold text-gray-900 mb-4">
            {activeTab === "paths" ? "เส้นทาง" : "หมวดหมู่"} ({activeTab === "paths" ? learningPaths.length : categories.length})
          </h3>
          {activeTab === "all" && (
            <p className="text-xs text-gray-500 mb-4">เลือกหมวดหมู่เพื่อกรองคอร์สเรียน</p>
          )}

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {loadingCategories ? (
              <p className="text-sm text-gray-500">กำลังโหลด...</p>
            ) : activeTab === "paths" ? (
              learningPaths.length > 0 ? (
                learningPaths.map((path) => (
                  <Link
                    key={path._id}
                    href={`/learning-paths/${path._id}`}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors group"
                  >
                    <input type="checkbox" className="w-4 h-4 rounded cursor-pointer" readOnly />
                    <span className="text-sm text-gray-700 group-hover:text-indigo-600 flex-1">{path.title}</span>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-gray-500">ไม่มีเส้นทาง</p>
              )
            ) : categories.length > 0 ? (
              categories.map((cat) => (
                <div
                  key={cat.name}
                  className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-indigo-50 transition-colors group"
                >
                  <span className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded cursor-pointer" 
                      checked={selectedCategory === cat.name}
                      onChange={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)}
                    />
                    <span className="text-sm text-gray-700 group-hover:text-indigo-600">{cat.name}</span>
                  </span>
                  <span className="text-xs text-gray-500">({cat.count})</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">ไม่มีหมวดหมู่</p>
            )}
          </div>

          {/* Difficulty Filter */}
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-semibold text-gray-900 mb-3 text-sm">ระดับความยาก</h4>
            {[
              { label: "ง่าย", value: "easy" },
              { label: "ปานกลาง", value: "medium" },
              { label: "ยาก", value: "hard" },
            ].map((diff) => (
              <label key={diff.value} className="flex items-center gap-2 mb-2 cursor-pointer hover:text-indigo-600">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded cursor-pointer"
                  checked={selectedDifficulties.has(diff.value)}
                  onChange={(e) => {
                    const newDifficulties = new Set(selectedDifficulties);
                    if (e.target.checked) {
                      newDifficulties.add(diff.value);
                    } else {
                      newDifficulties.delete(diff.value);
                    }
                    setSelectedDifficulties(newDifficulties);
                  }}
                />
                <span className="text-sm text-gray-600">{diff.label}</span>
              </label>
            ))}
          </div>

          {/* Duration */}
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-semibold text-gray-900 mb-3 text-sm">ความยาวคอร์ส</h4>
            {[
              { label: "0 - 1 ชั่วโมง", value: "0-60" },
              { label: "1 - 2 ชั่วโมง", value: "60-120" },
              { label: "2 - 4 ชั่วโมง", value: "120-240" },
              { label: "4 ชั่วโมงขึ้นไป", value: "240+" },
            ].map((dur) => (
              <label key={dur.value} className="flex items-center gap-2 mb-2 cursor-pointer hover:text-indigo-600">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded cursor-pointer"
                  checked={selectedDurations.has(dur.value)}
                  onChange={(e) => {
                    const newDurations = new Set(selectedDurations);
                    if (e.target.checked) {
                      newDurations.add(dur.value);
                    } else {
                      newDurations.delete(dur.value);
                    }
                    setSelectedDurations(newDurations);
                  }}
                />
                <span className="text-sm text-gray-600">{dur.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:col-span-3">
        {/* Tabs */}
        <div className="mb-8 flex gap-4 border-b border-gray-200 pb-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`font-medium text-sm pb-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-b-2 border-indigo-600 text-indigo-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === "all" ? (
          <>
            {/* Online Courses Section */}
            {(() => {
              const onlineCourses = filteredCourses.filter((c) => (c.type || "online") === "online");
              return onlineCourses.length > 0 ? (
                <div className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">คอร์สเรียน Online</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
                    {onlineCourses.slice(0, 6).map((course) => (




<div key={course._id} className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-shadow group">
                      <Link href={`/courses/${course._id}`}>
                        <div className="relative h-40 bg-gradient-to-br from-indigo-100 to-purple-100 overflow-hidden cursor-pointer">
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
                        </div>
                      </Link>

                      <div className="px-4 pt-2 pb-1 flex items-center gap-2 min-w-0">
                        <span className="text-xs font-semibold text-gray-700 whitespace-nowrap">
                          {(course.type || "online") === "online" ? "คอร์สเรียน" : course.type === "live online" ? "คอร์สเรียน Live" : "คอร์สเรียน Onsite"}
                        </span>
                        {(course as any).categoryName && (
                          <span className="text-xs font-medium bg-gray-100 text-gray-700 px-3 py-1 rounded-full truncate">
                            {(course as any).categoryName}
                          </span>
                        )}
                      </div>

                      <div className="px-4 pb-1">
                        <h3 className="font-bold text-gray-900 line-clamp-2 text-sm group-hover:text-indigo-600 transition-colors">
                          {course.title}
                        </h3>
                      </div>

                      <div className="px-4 py-1">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 flex-shrink-0">
                            {course.instructor?.[0] || "U"}
                          </div>
                          <span className="text-xs text-gray-600 truncate">{course.instructor}</span>
                        </div>
                      </div>

                      <div className="px-4 py-1 flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <span>👥</span>
                          <span>{course.enrollmentCount || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>⏱️</span>
                          <span>{course.duration || 0} นาที</span>
                        </div>
                      </div>

                      <div className="px-4 py-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold text-red-600">
                            {(course.price || 0) === 0 ? "ฟรี" : `฿${course.price || "0"}`}
                          </span>
                          {(course.price || 0) > 0 && (
                            <span className="text-lg text-gray-400 line-through">
                              ฿{Math.round((course.price as number) * 1.3)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="px-4 py-3 flex gap-2">
                        <button
                          onClick={() => handleAddToCart(course)}
                          className="w-12 py-2 border-2 border-indigo-600 text-indigo-600 rounded-lg font-semibold text-sm hover:bg-indigo-50 transition-colors flex items-center justify-center flex-shrink-0"
                          title="ใส่ตะกร้า"
                        >
                          <ShoppingCart className="w-5 h-5" />
                        </button>
                        {(course.type || "online") === "online" ? (
                          <Link href={`/checkout/courses/${course._id}`} className="flex-1">
                            <button className="w-full py-2 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors">
                              ซื้อเลย
                            </button>
                          </Link>
                        ) : (
                          <Link href={`/courses/${course._id}`} className="flex-1">
                            <button className="w-full py-2 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors">
                              จองที่นั่ง
                            </button>
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                  </div>
                  <div className="flex justify-center mt-6">
                    <button onClick={() => setActiveTab("online")} className="px-6 py-2 border-2 border-indigo-600 text-indigo-600 rounded-full font-semibold text-sm hover:bg-indigo-50 transition-colors">
                      ดูคอร์สเพิ่มเติม
                    </button>
                  </div>
                </div>
              ) : null;
            })()}

            {/* Learning Paths Section */}
            {(() => {
              return filteredLearningPaths.length > 0 ? (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">เส้นทางการเรียน</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                  {filteredLearningPaths.map((path) => (
                    <Link key={path._id} href={`/learning-paths/${path._id}`} className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-shadow group flex flex-col">
                      <div className="flex gap-3 p-3">
                        <div className="relative w-48 h-28 bg-gradient-to-br from-indigo-100 to-purple-100 overflow-hidden cursor-pointer flex items-center justify-center rounded-lg flex-shrink-0">
                          {path.coverImage ? (
                            <Image
                              src={path.coverImage}
                              alt={path.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <span className="text-4xl">🗺️</span>
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                            <div className="flex items-center gap-1">
                              <span>📚</span>
                              <span className="font-medium">{path.courses?.length || 0} คอร์สเรียน</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span>⏱️</span>
                              <span className="font-medium">{formatDuration(path.estimatedHours || 0)}</span>
                            </div>
                          </div>

                          <div className="text-xs">
                            <p className="text-gray-700 font-semibold mb-1">ประกอบด้วยคอร์สเรียน</p>
                            <div className="text-gray-600 space-y-0.5 mb-1">
                              {path.courses?.slice(0, 3).map((course: any, idx: number) => (
                                <p key={idx} className="truncate text-xs">
                                  {idx + 1}. {typeof course === 'object' ? course.title : course}
                                </p>
                              ))}
                            </div>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                router.push(`/learning-paths/${path._id}`);
                              }}
                              className="text-indigo-600 hover:text-indigo-700 font-semibold text-xs"
                            >
                              ดูเพิ่มเติม
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="px-3 py-2">
                        <h3 className="font-bold text-gray-900 line-clamp-2 text-2xl group-hover:text-indigo-600 transition-colors mb-1">
                          {path.title}
                        </h3>
                      </div>

                      <div className="flex items-center justify-between gap-2 px-3 py-2 mt-auto">
                        <div className="flex items-center gap-2">
                          {(() => {
                            const finalPrice = Math.round((path.price || 0) - (path.discountType === "percentage" ? (path.price || 0) * (path.discount || 0) / 100 : (path.discount || 0)));
                            return (
                              <>
                                <span className="text-3xl font-bold text-red-600">
                                  {finalPrice <= 0 ? "ฟรี" : `฿${finalPrice.toLocaleString()}`}
                                </span>
                                {(path.discount || 0) > 0 && (path.price || 0) > 0 && finalPrice > 0 && (
                                  <span className="text-xl text-gray-400 line-through">
                                    ฿{(path.price || 0).toLocaleString()}
                                  </span>
                                )}
                              </>
                            );
                          })()}
                        </div>

                        <div className="flex items-center gap-2 ml-auto" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleAddToCart(path);
                            }}
                            className="p-2 border-2 border-indigo-600 text-indigo-600 rounded hover:bg-indigo-50 transition-colors"
                            title="ใส่ตะกร้า"
                          >
                            <ShoppingCart className="w-5 h-5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              router.push(`/checkout/learning-paths/${path._id}`);
                            }}
                            className="flex-1 px-12 py-2 bg-indigo-600 text-white rounded font-semibold text-lg hover:bg-indigo-700 transition-colors"
                          >
                            ซื้อเส้นทางนี้
                          </button>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="flex justify-center mt-8">
                  <button
                    onClick={() => setActiveTab("paths")}
                    className="px-6 py-2 border-2 border-indigo-600 text-indigo-600 rounded-full font-semibold text-sm hover:bg-indigo-50 transition-colors"
                  >
                    ดูเส้นทางเพิ่มเติม
                  </button>
                </div>
              </div>
            ) : null;
            })()}

            {/* Live Courses Section */}
            {(() => {
              const liveCourses = filteredCourses.filter((c) => c.type === "live online");
              return liveCourses.length > 0 ? (
                <div className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">คอร์สเรียน Live</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 mb-6">
                    {liveCourses.slice(0, 3).map((course) => (
                      <div key={course._id} className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-shadow group">
                        <Link href={`/courses/${course._id}`}>
                          <div className="relative h-40 bg-gradient-to-br from-indigo-100 to-purple-100 overflow-hidden cursor-pointer">
                            {course.coverImage ? (
                              <Image src={course.coverImage} alt={course.title} fill className="object-cover group-hover:scale-105 transition-transform" />
                            ) : (
                              <div className="flex items-center justify-center h-full"><span className="text-4xl">📚</span></div>
                            )}
                          </div>
                        </Link>
                        <div className="px-4 pt-2 pb-1 flex items-center gap-2 min-w-0">
                          <span className="text-xs font-semibold text-gray-700 whitespace-nowrap">คอร์สเรียน Live</span>
                          {(course as any).categoryName && (
                            <span className="text-xs font-medium bg-gray-100 text-gray-700 px-3 py-1 rounded-full truncate">{(course as any).categoryName}</span>
                          )}
                        </div>
                        <div className="px-4 pb-1">
                          <h3 className="font-bold text-gray-900 line-clamp-2 text-sm group-hover:text-indigo-600 transition-colors">{course.title}</h3>
                        </div>
                        <div className="px-4 py-1">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 flex-shrink-0">{course.instructor?.[0] || "U"}</div>
                            <span className="text-xs text-gray-600 truncate">{course.instructor}</span>
                          </div>
                        </div>
                        <div className="px-4 py-1 flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-1"><span>👥</span><span>{course.enrollmentCount || 0}</span></div>
                          <div className="flex items-center gap-1"><span>⏱️</span><span>{course.duration || 0} นาที</span></div>
                        </div>
                        <div className="px-4 py-1">
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-red-600">{(course.price || 0) === 0 ? "ฟรี" : `฿${course.price || "0"}`}</span>
                            {(course.price || 0) > 0 && (
                              <span className="text-lg text-gray-400 line-through">฿{Math.round((course.price as number) * 1.3)}</span>
                            )}
                          </div>
                        </div>
                        <div className="px-4 py-3 flex gap-2">
                          <button onClick={() => handleAddToCart(course)} className="w-12 py-2 border-2 border-indigo-600 text-indigo-600 rounded-lg font-semibold text-sm hover:bg-indigo-50 transition-colors flex items-center justify-center flex-shrink-0" title="ใส่ตะกร้า">
                            <ShoppingCart className="w-5 h-5" />
                          </button>
                          <Link href={`/courses/${course._id}`} className="flex-1">
                            <button className="w-full py-2 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors">จองที่นั่ง</button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-center">
                    <button onClick={() => setActiveTab("live-online")} className="px-6 py-2 border-2 border-indigo-600 text-indigo-600 rounded-full font-semibold text-sm hover:bg-indigo-50 transition-colors">
                      ดูคอร์สเพิ่มเติม
                    </button>
                  </div>
                </div>
              ) : null;
            })()}

            {/* Onsite Courses Section */}
            {(() => {
              const onsiteCourses = filteredCourses.filter((c) => c.type === "onsite");
              return onsiteCourses.length > 0 ? (
                <div className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">คอร์สเรียน Onsite</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 mb-6">
                    {onsiteCourses.slice(0, 3).map((course) => (
                      <div key={course._id} className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-shadow group">
                        <Link href={`/courses/${course._id}`}>
                          <div className="relative h-40 bg-gradient-to-br from-indigo-100 to-purple-100 overflow-hidden cursor-pointer">
                            {course.coverImage ? (
                              <Image src={course.coverImage} alt={course.title} fill className="object-cover group-hover:scale-105 transition-transform" />
                            ) : (
                              <div className="flex items-center justify-center h-full"><span className="text-4xl">📚</span></div>
                            )}
                          </div>
                        </Link>
                        <div className="px-4 pt-2 pb-1 flex items-center gap-2 min-w-0">
                          <span className="text-xs font-semibold text-gray-700 whitespace-nowrap">คอร์สเรียน Onsite</span>
                          {(course as any).categoryName && (
                            <span className="text-xs font-medium bg-gray-100 text-gray-700 px-3 py-1 rounded-full truncate">{(course as any).categoryName}</span>
                          )}
                        </div>
                        <div className="px-4 pb-1">
                          <h3 className="font-bold text-gray-900 line-clamp-2 text-sm group-hover:text-indigo-600 transition-colors">{course.title}</h3>
                        </div>
                        <div className="px-4 py-1">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 flex-shrink-0">{course.instructor?.[0] || "U"}</div>
                            <span className="text-xs text-gray-600 truncate">{course.instructor}</span>
                          </div>
                        </div>
                        <div className="px-4 py-1 flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-1"><span>👥</span><span>{course.enrollmentCount || 0}</span></div>
                          <div className="flex items-center gap-1"><span>⏱️</span><span>{course.duration || 0} นาที</span></div>
                        </div>
                        <div className="px-4 py-1">
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-red-600">{(course.price || 0) === 0 ? "ฟรี" : `฿${course.price || "0"}`}</span>
                            {(course.price || 0) > 0 && (
                              <span className="text-lg text-gray-400 line-through">฿{Math.round((course.price as number) * 1.3)}</span>
                            )}
                          </div>
                        </div>
                        <div className="px-4 py-3 flex gap-2">
                          <button onClick={() => handleAddToCart(course)} className="w-12 py-2 border-2 border-indigo-600 text-indigo-600 rounded-lg font-semibold text-sm hover:bg-indigo-50 transition-colors flex items-center justify-center flex-shrink-0" title="ใส่ตะกร้า">
                            <ShoppingCart className="w-5 h-5" />
                          </button>
                          <Link href={`/courses/${course._id}`} className="flex-1">
                            <button className="w-full py-2 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors">จองที่นั่ง</button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-center">
                    <button onClick={() => setActiveTab("onsite")} className="px-6 py-2 border-2 border-indigo-600 text-indigo-600 rounded-full font-semibold text-sm hover:bg-indigo-50 transition-colors">
                      ดูคอร์สเพิ่มเติม
                    </button>
                  </div>
                </div>
              ) : null;
            })()}
          </>
        ) : activeTab === "paths" ? (
          filteredLearningPaths.length > 0 ? (
            (() => {
              const itemsPerPage = 8;
              const page = currentPage["paths"] || 1;
              const startIndex = (page - 1) * itemsPerPage;
              const endIndex = startIndex + itemsPerPage;
              const paginatedPaths = filteredLearningPaths.slice(startIndex, endIndex);
              const totalPages = Math.ceil(filteredLearningPaths.length / itemsPerPage);

              return (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
                {paginatedPaths.map((path) => (
                <Link key={path._id} href={`/learning-paths/${path._id}`} className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-shadow group flex flex-col">
                  <div className="flex gap-3 p-3">
                    <div className="relative w-48 h-28 bg-gradient-to-br from-indigo-100 to-purple-100 overflow-hidden cursor-pointer flex items-center justify-center rounded-lg flex-shrink-0">
                      {path.coverImage ? (
                        <Image
                          src={path.coverImage}
                          alt={path.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <span className="text-4xl">🗺️</span>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <span>📚</span>
                          <span className="font-medium">{path.courses?.length || 0} คอร์สเรียน</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>⏱️</span>
                          <span className="font-medium">{formatDuration(path.estimatedHours || 0)}</span>
                        </div>
                      </div>

                      <div className="text-xs">
                        <p className="text-gray-700 font-semibold mb-1">ประกอบด้วยคอร์สเรียน</p>
                        <div className="text-gray-600 space-y-0.5 mb-1">
                          {path.courses?.slice(0, 3).map((course: any, idx: number) => (
                            <p key={idx} className="truncate text-xs">
                              {idx + 1}. {typeof course === 'object' ? course.title : course}
                            </p>
                          ))}
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            router.push(`/learning-paths/${path._id}`);
                          }}
                          className="text-indigo-600 hover:text-indigo-700 font-semibold text-xs"
                        >
                          ดูเพิ่มเติม
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="px-3 py-2">
                    <h3 className="font-bold text-gray-900 line-clamp-2 text-2xl group-hover:text-indigo-600 transition-colors mb-1">
                      {path.title}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between gap-2 px-3 py-2 mt-auto">
                    <div className="flex items-center gap-2">
                      {(() => {
                        const finalPrice = Math.round((path.price || 0) - (path.discountType === "percentage" ? (path.price || 0) * (path.discount || 0) / 100 : (path.discount || 0)));
                        return (
                          <>
                            <span className="text-3xl font-bold text-red-600">
                              {finalPrice <= 0 ? "ฟรี" : `฿${finalPrice.toLocaleString()}`}
                            </span>
                            {(path.discount || 0) > 0 && (path.price || 0) > 0 && finalPrice > 0 && (
                              <span className="text-xl text-gray-400 line-through">
                                ฿{(path.price || 0).toLocaleString()}
                              </span>
                            )}
                          </>
                        );
                      })()}
                    </div>

                    <div className="flex items-center gap-2 ml-auto" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleAddToCart(path);
                        }}
                        className="p-2 border-2 border-indigo-600 text-indigo-600 rounded hover:bg-indigo-50 transition-colors"
                        title="ใส่ตะกร้า"
                      >
                        <ShoppingCart className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          router.push(`/checkout/learning-paths/${path._id}`);
                        }}
                        className="flex-1 px-12 py-2 bg-indigo-600 text-white rounded font-semibold text-lg hover:bg-indigo-700 transition-colors"
                      >
                        ซื้อเส้นทางนี้
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
              </div>
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-10">
                  <button
                    onClick={() => setCurrentPage({ ...currentPage, paths: Math.max(1, page - 1) })}
                    disabled={page === 1}
                    className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    &lt;
                  </button>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={page}
                      onChange={(e) => {
                        const newPage = Math.max(1, Math.min(totalPages, parseInt(e.target.value) || 1));
                        setCurrentPage({ ...currentPage, paths: newPage });
                      }}
                      className="w-12 h-10 border-2 border-indigo-600 rounded-lg text-center font-semibold focus:outline-none"
                    />
                    <span className="text-gray-600">/ {totalPages}</span>
                  </div>
                  <button
                    onClick={() => setCurrentPage({ ...currentPage, paths: Math.min(totalPages, page + 1) })}
                    disabled={page === totalPages}
                    className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    &gt;
                  </button>
                </div>
              )}
            </>
              );
            })()
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">ไม่มีเส้นทางการเรียนที่ตรงกับตัวกรอง</p>
            </div>
          )
        ) : filteredCourses.length > 0 ? (
          (() => {
            const itemsPerPage = activeTab === "online" ? 6 : activeTab === "live-online" ? 6 : activeTab === "onsite" ? 6 : 6;
            const page = currentPage[activeTab] || 1;
            const startIndex = (page - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const paginatedCourses = filteredCourses.slice(startIndex, endIndex);
            const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);

            return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 mb-8">
              {paginatedCourses.map((course) => (
                <div key={course._id} className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-shadow group">
                  <Link href={`/courses/${course._id}`}>
                    <div className="relative h-40 bg-gradient-to-br from-indigo-100 to-purple-100 overflow-hidden cursor-pointer">
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
                    </div>
                  </Link>

                  <div className="px-4 pt-2 pb-1 flex items-center gap-2 min-w-0">
                    <span className="text-xs font-semibold text-gray-700 whitespace-nowrap">
                      {activeTab === "online" ? "คอร์สเรียน" : activeTab === "live-online" ? "คอร์สเรียน Live" : "คอร์สเรียน Onsite"}
                    </span>
                    {(course as any).categoryName && (
                      <span className="text-xs font-medium bg-gray-100 text-gray-700 px-3 py-1 rounded-full truncate">
                        {(course as any).categoryName}
                      </span>
                    )}
                  </div>

                  <div className="px-4 pb-1">
                    <h3 className="font-bold text-gray-900 line-clamp-2 text-sm group-hover:text-indigo-600 transition-colors">
                      {course.title}
                    </h3>
                  </div>

                  <div className="px-4 py-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 flex-shrink-0">
                        {course.instructor?.[0] || "U"}
                      </div>
                      <span className="text-xs text-gray-600 truncate">{course.instructor}</span>
                    </div>
                  </div>

                  <div className="px-4 py-1 flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <span>👥</span>
                      <span>{course.enrollmentCount || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>⏱️</span>
                      <span>{course.duration || 0} นาที</span>
                    </div>
                  </div>

                  <div className="px-4 py-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-red-600">
                        {(course.price || 0) === 0 ? "ฟรี" : `฿${course.price || "0"}`}
                      </span>
                      {(course.price || 0) > 0 && (
                        <span className="text-lg text-gray-400 line-through">
                          ฿{Math.round((course.price as number) * 1.3)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="px-4 py-3 flex gap-2">
                    <button
                      onClick={() => handleAddToCart(course)}
                      className="w-12 py-2 border-2 border-indigo-600 text-indigo-600 rounded-lg font-semibold text-sm hover:bg-indigo-50 transition-colors flex items-center justify-center flex-shrink-0"
                      title="ใส่ตะกร้า"
                    >
                      <ShoppingCart className="w-5 h-5" />
                    </button>
                    {activeTab === "online" ? (
                      <Link href={`/checkout/courses/${course._id}`} className="flex-1">
                        <button className="w-full py-2 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors">
                          ซื้อเลย
                        </button>
                      </Link>
                    ) : (
                      <Link href={`/courses/${course._id}`} className="flex-1">
                        <button className="w-full py-2 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors">
                          จองที่นั่ง
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <button
                  onClick={() => setCurrentPage({ ...currentPage, [activeTab]: Math.max(1, page - 1) })}
                  disabled={page === 1}
                  className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  &lt;
                </button>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={page}
                    onChange={(e) => {
                      const newPage = Math.max(1, Math.min(totalPages, parseInt(e.target.value) || 1));
                      setCurrentPage({ ...currentPage, [activeTab]: newPage });
                    }}
                    className="w-12 h-10 border-2 border-indigo-600 rounded-lg text-center font-semibold focus:outline-none"
                  />
                  <span className="text-gray-600">/ {totalPages}</span>
                </div>
                <button
                  onClick={() => setCurrentPage({ ...currentPage, [activeTab]: Math.min(totalPages, page + 1) })}
                  disabled={page === totalPages}
                  className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  &gt;
                </button>
              </div>
            )}
          </>
            );
          })()
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">ไม่พบคอร์สในแท็บนี้</p>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
