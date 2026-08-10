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
        console.error("Failed to fetch data:", error);
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
    { id: "all", label: "ทั้งหมด", count: courses.length },
    { id: "online", label: "คอร์สเรียน", count: courses.filter((c) => (c.type || "online") === "online").length },
    { id: "live-online", label: "คอร์สเรียน Live", count: courses.filter((c) => c.type === "live online").length },
    { id: "paths", label: "เส้นทางการเรียน", count: learningPaths.length },
    { id: "onsite", label: "คอร์สเรียน Onsite", count: courses.filter((c) => c.type === "onsite").length },
  ] as const;

  const filteredCourses = courses.filter((c) => {
    if (activeTab === "paths") {
      return false;
    }

    if (activeTab === "all") {
      if (!selectedCategory) return true;
      return (c as any).categoryName && (c as any).categoryName.toLowerCase() === selectedCategory.toLowerCase();
    }

    const typeMatches =
      (activeTab === "online" && (c.type || "online") === "online") ||
      (activeTab === "live-online" && c.type === "live online") ||
      (activeTab === "onsite" && c.type === "onsite");

    let categoryMatches = true;
    if (selectedCategory) {
      categoryMatches = (c as any).categoryName && (c as any).categoryName.toLowerCase() === selectedCategory.toLowerCase();
    }

    return typeMatches && categoryMatches;
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

          {/* Price Range */}
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-semibold text-gray-900 mb-3 text-sm">ระดับ</h4>
            {["ฟรี", "ปรึกษา", "บาท"].map((price) => (
              <label key={price} className="flex items-center gap-2 mb-2 cursor-pointer hover:text-indigo-600">
                <input type="checkbox" className="w-4 h-4 rounded cursor-pointer" />
                <span className="text-sm text-gray-600">{price}</span>
              </label>
            ))}
          </div>

          {/* Duration */}
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-semibold text-gray-900 mb-3 text-sm">ความยาวคอร์ส</h4>
            {["0 - 1 ชั่วโมง", "1 - 2 ชั่วโมง", "2 - 4 ชั่วโมง", "4 ชั่วโมงขึ้นไป"].map((duration) => (
              <label key={duration} className="flex items-center gap-2 mb-2 cursor-pointer hover:text-indigo-600">
                <input type="checkbox" className="w-4 h-4 rounded cursor-pointer" />
                <span className="text-sm text-gray-600">{duration}</span>
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
              const onlineCourses = courses.filter((c) => (c.type || "online") === "online");
              return onlineCourses.length > 0 ? (
                <div className="mb-12">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">คอร์สเรียน Online</h2>
                    {onlineCourses.length > 6 && (
                      <button
                        onClick={() => setActiveTab("online")}
                        className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm"
                      >
                        ดูคอร์สเพิ่มเติม
                      </button>
                    )}
                  </div>
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

                      <div className="px-4 pt-4 pb-3 flex items-center gap-2 min-w-0">
                        <span className="text-xs font-semibold text-gray-700 whitespace-nowrap">
                          {(course.type || "online") === "online" ? "คอร์สเรียน" : course.type === "live online" ? "คอร์สเรียน Live" : "คอร์สเรียน Onsite"}
                        </span>
                        {(course as any).categoryName && (
                          <span className="text-xs font-medium bg-gray-100 text-gray-700 px-3 py-1 rounded-full truncate">
                            {(course as any).categoryName}
                          </span>
                        )}
                      </div>

                      <div className="px-4 pb-3">
                        <h3 className="font-bold text-gray-900 line-clamp-2 text-sm group-hover:text-indigo-600 transition-colors">
                          {course.title}
                        </h3>
                      </div>

                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 flex-shrink-0">
                            {course.instructor?.[0] || "U"}
                          </div>
                          <span className="text-xs text-gray-600 truncate">{course.instructor}</span>
                        </div>
                      </div>

                      <div className="px-4 py-3 flex items-center justify-between text-xs text-gray-500 border-b border-gray-100">
                        <div className="flex items-center gap-1">
                          <span>👥</span>
                          <span>{course.enrollmentCount || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>⏱️</span>
                          <span>{course.duration || 0} นาที</span>
                        </div>
                      </div>

                      <div className="px-4 py-3 border-b border-gray-100">
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
                </div>
              ) : null;
            })()}

            {/* Learning Paths Section */}
            {(() => {
              return learningPaths.length > 0 ? (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">เส้นทางการเรียน</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                  {learningPaths.map((path) => (
                    <Link key={path._id} href={`/learning-paths/${path._id}`} className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-shadow group flex flex-col">
                      <div className="flex gap-4 p-4">
                        <div className="relative w-56 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 overflow-hidden cursor-pointer flex items-center justify-center rounded-lg flex-shrink-0">
                          {path.coverImage ? (
                            <Image
                              src={path.coverImage}
                              alt={path.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <span className="text-5xl">🗺️</span>
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-3 text-xs text-gray-600 mb-3">
                            <div className="flex items-center gap-1.5">
                              <span>📚</span>
                              <span className="font-medium">{path.courses?.length || 0} คอร์สเรียน</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span>⏱️</span>
                              <span className="font-medium">{formatDuration(path.estimatedHours || 0)}</span>
                            </div>
                          </div>

                          <div className="text-xs">
                            <p className="text-gray-700 font-semibold mb-2">ประกอบด้วยคอร์สเรียน</p>
                            <div className="text-gray-600 space-y-1 mb-2">
                              {path.courses?.slice(0, 3).map((course: any, idx: number) => (
                                <p key={idx} className="truncate">
                                  {idx + 1}. {typeof course === 'object' ? course.title : course}
                                </p>
                              ))}
                            </div>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                router.push(`/learning-paths/${path._id}`);
                              }}
                              className="text-indigo-600 hover:text-indigo-700 font-semibold"
                            >
                              ดูเพิ่มเติม
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="px-4 py-3 border-t border-gray-100">
                        <h3 className="font-bold text-gray-900 line-clamp-2 text-2xl group-hover:text-indigo-600 transition-colors mb-1.5">
                          {path.title}
                        </h3>
                      </div>

                      <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-gray-100 mt-auto">
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
                <div className="flex justify-center">
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
              const liveCourses = courses.filter((c) => c.type === "live online");
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
                        <div className="px-4 pt-4 pb-3 flex items-center gap-2 min-w-0">
                          <span className="text-xs font-semibold text-gray-700 whitespace-nowrap">คอร์สเรียน Live</span>
                          {(course as any).categoryName && (
                            <span className="text-xs font-medium bg-gray-100 text-gray-700 px-3 py-1 rounded-full truncate">{(course as any).categoryName}</span>
                          )}
                        </div>
                        <div className="px-4 pb-3">
                          <h3 className="font-bold text-gray-900 line-clamp-2 text-sm group-hover:text-indigo-600 transition-colors">{course.title}</h3>
                        </div>
                        <div className="px-4 py-3 border-b border-gray-100">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 flex-shrink-0">{course.instructor?.[0] || "U"}</div>
                            <span className="text-xs text-gray-600 truncate">{course.instructor}</span>
                          </div>
                        </div>
                        <div className="px-4 py-3 flex items-center justify-between text-xs text-gray-500 border-b border-gray-100">
                          <div className="flex items-center gap-1"><span>👥</span><span>{course.enrollmentCount || 0}</span></div>
                          <div className="flex items-center gap-1"><span>⏱️</span><span>{course.duration || 0} นาที</span></div>
                        </div>
                        <div className="px-4 py-3 border-b border-gray-100">
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
              const onsiteCourses = courses.filter((c) => c.type === "onsite");
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
                        <div className="px-4 pt-4 pb-3 flex items-center gap-2 min-w-0">
                          <span className="text-xs font-semibold text-gray-700 whitespace-nowrap">คอร์สเรียน Onsite</span>
                          {(course as any).categoryName && (
                            <span className="text-xs font-medium bg-gray-100 text-gray-700 px-3 py-1 rounded-full truncate">{(course as any).categoryName}</span>
                          )}
                        </div>
                        <div className="px-4 pb-3">
                          <h3 className="font-bold text-gray-900 line-clamp-2 text-sm group-hover:text-indigo-600 transition-colors">{course.title}</h3>
                        </div>
                        <div className="px-4 py-3 border-b border-gray-100">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 flex-shrink-0">{course.instructor?.[0] || "U"}</div>
                            <span className="text-xs text-gray-600 truncate">{course.instructor}</span>
                          </div>
                        </div>
                        <div className="px-4 py-3 flex items-center justify-between text-xs text-gray-500 border-b border-gray-100">
                          <div className="flex items-center gap-1"><span>👥</span><span>{course.enrollmentCount || 0}</span></div>
                          <div className="flex items-center gap-1"><span>⏱️</span><span>{course.duration || 0} นาที</span></div>
                        </div>
                        <div className="px-4 py-3 border-b border-gray-100">
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
          learningPaths.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {learningPaths.map((path) => (
                <Link key={path._id} href={`/learning-paths/${path._id}`} className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-shadow group flex flex-col">
                  <div className="flex gap-4 p-4">
                    <div className="relative w-56 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 overflow-hidden cursor-pointer flex items-center justify-center rounded-lg flex-shrink-0">
                      {path.coverImage ? (
                        <Image
                          src={path.coverImage}
                          alt={path.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <span className="text-5xl">🗺️</span>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 text-xs text-gray-600 mb-3">
                        <div className="flex items-center gap-1.5">
                          <span>📚</span>
                          <span className="font-medium">{path.courses?.length || 0} คอร์สเรียน</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span>⏱️</span>
                          <span className="font-medium">{formatDuration(path.estimatedHours || 0)}</span>
                        </div>
                      </div>

                      <div className="text-xs">
                        <p className="text-gray-700 font-semibold mb-2">ประกอบด้วยคอร์สเรียน</p>
                        <div className="text-gray-600 space-y-1 mb-2">
                          {path.courses?.slice(0, 3).map((course: any, idx: number) => (
                            <p key={idx} className="truncate">
                              {idx + 1}. {typeof course === 'object' ? course.title : course}
                            </p>
                          ))}
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            router.push(`/learning-paths/${path._id}`);
                          }}
                          className="text-indigo-600 hover:text-indigo-700 font-semibold"
                        >
                          ดูเพิ่มเติม
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="px-4 py-3 border-t border-gray-100">
                    <h3 className="font-bold text-gray-900 line-clamp-2 text-2xl group-hover:text-indigo-600 transition-colors mb-1.5">
                      {path.title}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-gray-100 mt-auto">
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
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">ไม่มีเส้นทางการเรียน</p>
            </div>
          )
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
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

                <div className="px-4 pt-4 pb-3 flex items-center gap-2 min-w-0">
                  <span className="text-xs font-semibold text-gray-700 whitespace-nowrap">
                    {activeTab === "online" ? "คอร์สเรียน" : activeTab === "live-online" ? "คอร์สเรียน Live" : "คอร์สเรียน Onsite"}
                  </span>
                  {(course as any).categoryName && (
                    <span className="text-xs font-medium bg-gray-100 text-gray-700 px-3 py-1 rounded-full truncate">
                      {(course as any).categoryName}
                    </span>
                  )}
                </div>

                <div className="px-4 pb-3">
                  <h3 className="font-bold text-gray-900 line-clamp-2 text-sm group-hover:text-indigo-600 transition-colors">
                    {course.title}
                  </h3>
                </div>

                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 flex-shrink-0">
                      {course.instructor?.[0] || "U"}
                    </div>
                    <span className="text-xs text-gray-600 truncate">{course.instructor}</span>
                  </div>
                </div>

                <div className="px-4 py-3 flex items-center justify-between text-xs text-gray-500 border-b border-gray-100">
                  <div className="flex items-center gap-1">
                    <span>👥</span>
                    <span>{course.enrollmentCount || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>⏱️</span>
                    <span>{course.duration || 0} นาที</span>
                  </div>
                </div>

                <div className="px-4 py-3 border-b border-gray-100">
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
