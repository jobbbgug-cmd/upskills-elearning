"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import DuplicateItemModal from "./DuplicateItemModal";

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
  categoryName?: string;
  enrollmentCount?: number;
  price?: number;
  type?: string;
  duration?: number;
}

export default function CategoriesAndCourses() {
  const router = useRouter();
  const { addToCart } = useCart();
  const [categories, setCategories] = useState<Category[]>([]);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const handleAddToCart = (course: Course) => {
    const wasAdded = addToCart(course as any);
    if (!wasAdded) {
      setShowDuplicateModal(true);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesRes = await fetch("/api/categories?type=online");
        const categoriesData = await categoriesRes.json();
        const cats = categoriesData.categories || [];
        setCategories(cats);

        if (cats.length > 0) {
          setSelectedCategory(cats[0]._id);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!selectedCategory) return;

      try {
        setLoading(true);
        const url = `/api/courses?type=online&category=${selectedCategory}&limit=100`;
        const coursesRes = await fetch(url);
        const coursesData = await coursesRes.json();
        setCourses(coursesData.courses || []);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [selectedCategory]);

  const filteredCourses = courses;


  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            
             400+ คอร์สเรียนออนไลน์ ใน {categories.length} หมวดหมู่
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-100 rounded-xl h-auto animate-pulse" style={{minHeight: '350px'}} />
            ))}
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredCourses.slice(0, 4).map((course) => (
              <div key={course._id} onClick={() => router.push(`/courses/${course._id}`)} className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-shadow group flex flex-col cursor-pointer">
                <div className="relative h-40 bg-gradient-to-br from-indigo-100 to-purple-100 overflow-hidden">
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

                <div className="px-4 pt-2 pb-1 flex items-center gap-2 min-w-0">
                  <span className="text-xs font-semibold text-gray-700 whitespace-nowrap">
                    {(course.type || "online") === "online" ? "คอร์สเรียน" : course.type === "live online" ? "คอร์สเรียน Live" : "คอร์สเรียน Onsite"}
                  </span>
                  {course.categoryName && (
                    <span className="text-xs font-medium bg-gray-100 text-gray-700 px-3 py-1 rounded-full truncate">
                      {course.categoryName}
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

                <div className="px-4 py-3 flex gap-2 mt-auto">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleAddToCart(course);
                    }}
                    className="w-12 py-2 border-2 border-indigo-600 text-indigo-600 rounded-lg font-semibold text-sm hover:bg-indigo-50 transition-colors flex items-center justify-center flex-shrink-0"
                    title="ใส่ตะกร้า"
                  >
                    <ShoppingCart className="w-5 h-5" />
                  </button>
                  {(course.type || "online") === "online" ? (
                    <button onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      router.push(`/checkout/courses/${course._id}?referrer=${encodeURIComponent("/")}`);
                    }} className="flex-1 py-2 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors">
                      ซื้อเลย
                    </button>
                  ) : (
                    <button onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      router.push(`/courses/${course._id}`);
                    }} className="flex-1 py-2 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors">
                      จองที่นั่ง
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 font-medium">ไม่พบคอร์สในหมวดหมู่นี้</p>
          </div>
        )}

        <DuplicateItemModal
          isOpen={showDuplicateModal}
          onClose={() => setShowDuplicateModal(false)}
          itemName="คอร์ส"
        />
      </div>
    </section>
  );
}
