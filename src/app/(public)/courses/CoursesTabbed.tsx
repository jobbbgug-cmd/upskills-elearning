"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
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

    if (tab === "online" || tab === "live-online" || tab === "paths" || tab === "onsite") {
      setActiveTab(tab as TabType);
    } else {
      setActiveTab("all");
    }
    if (category) {
      setSelectedCategory(category);
    }
  }, [searchParams, mounted]);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingCategories(true);
      try {
        if (activeTab === "paths") {
          const res = await fetch("/api/learning-paths");
          const data = await res.json();
          setLearningPaths(data.paths || []);
          setCategories([]);
        } else {
          let apiUrl = "/api/categories?type=online";
          if (activeTab === "live-online") apiUrl = "/api/categories?type=live%20online";
          else if (activeTab === "onsite") apiUrl = "/api/categories?type=onsite";
          else if (activeTab === "all") apiUrl = "/api/categories";

          const res = await fetch(apiUrl);
          const data = await res.json();
          setCategories(data.categories || []);
          setLearningPaths([]);
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

  const filteredCourses = activeTab === "all"
    ? courses.filter((c) => !selectedCategory || (c as any).categoryName === selectedCategory)
    : courses.filter((c) => {
        const typeMatches =
          (activeTab === "online" && (c.type || "online") === "online") ||
          (activeTab === "live-online" && c.type === "live online") ||
          (activeTab === "onsite" && c.type === "onsite");

        const categoryMatches = !selectedCategory || (c as any).categoryName === selectedCategory;

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
        {activeTab === "paths" ? (
          learningPaths.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {learningPaths.map((path) => (
                <div key={path._id} className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-shadow group">
                  {/* Cover Image */}
                  <Link href={`/learning-paths/${path._id}`}>
                    <div className="relative h-40 bg-gradient-to-br from-indigo-100 to-purple-100 overflow-hidden cursor-pointer flex items-center justify-center">
                      <span className="text-5xl">🗺️</span>
                    </div>
                  </Link>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 line-clamp-2 text-sm group-hover:text-indigo-600 transition-colors mb-2">
                      {path.title}
                    </h3>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{path.description}</p>

                    {/* Instructor */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-600 flex-shrink-0">
                        {path.instructor?.[0] || "P"}
                      </div>
                      <span className="text-xs text-gray-600">{path.instructor}</span>
                    </div>

                    {/* Stats */}
                    <div className="px-4 py-3 flex items-center justify-between text-xs text-gray-500 border-b border-gray-100">
                      <div className="flex items-center gap-1">
                        <span>📚</span>
                        <span>{path.courses?.length || 0} คอร์สเรียน</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>⏱️</span>
                        <span>{formatDuration(path.estimatedHours || 0)}</span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-red-600">
                          ฿{Math.round((path.price || 0) - (path.discountType === "percentage" ? (path.price || 0) * (path.discount || 0) / 100 : (path.discount || 0))).toLocaleString()}
                        </span>
                        {(path.discount || 0) > 0 && (
                          <span className="text-sm text-gray-500 line-through">
                            ฿{(path.price || 0).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="px-4 py-3 flex gap-2 mt-3">
                      <button
                        onClick={() => handleAddToCart(path)}
                        className="flex-1 py-2 border-2 border-indigo-600 text-indigo-600 rounded-lg font-semibold text-sm hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
                      >
                        <span>🛒</span>
                        <span>ใส่ตะกร้า</span>
                      </button>
                      <Link href={`/learning-paths/${path._id}`} className="flex-1">
                        <button className="w-full py-2 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors">
                          ดูเส้นทาง
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
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
                {/* Course Image */}
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

                {/* Course Type Badge */}
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

                {/* Course Title */}
                <div className="px-4 pb-3">
                  <h3 className="font-bold text-gray-900 line-clamp-2 text-sm group-hover:text-indigo-600 transition-colors">
                    {course.title}
                  </h3>
                </div>

                {/* Instructor */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 flex-shrink-0">
                      {course.instructor?.[0] || "U"}
                    </div>
                    <span className="text-xs text-gray-600 truncate">{course.instructor}</span>
                  </div>
                </div>

                {/* Stats */}
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

                {/* Price */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-pink-600">
                      ฿{course.price || "0"}
                    </span>
                    {course.price && (
                      <span className="text-xs text-gray-400 line-through">
                        ฿{Math.round((course.price as number) * 1.3)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Buttons */}
                <div className="px-4 py-3 flex gap-2">
                  <button
                    onClick={() => handleAddToCart(course)}
                    className="flex-1 py-2 border-2 border-indigo-600 text-indigo-600 rounded-lg font-semibold text-sm hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <span>🛒</span>
                    <span>ใส่ตะกร้า</span>
                  </button>
                  <Link href={`/courses/${course._id}`} className="flex-1">
                    <button className="w-full py-2 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors">
                      ซื้อเลย
                    </button>
                  </Link>
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
