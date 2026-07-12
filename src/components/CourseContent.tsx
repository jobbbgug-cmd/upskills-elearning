"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ICourse } from "@/types";
import CourseTabs from "./CourseTabs";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";

interface CourseContentProps {
  courses: ICourse[];
}

export default function CourseContent({ courses }: CourseContentProps) {
  const [activeTab, setActiveTab] = useState("all");

  return (
    <>
      {/* Tabs */}
      <CourseTabs courseCount={courses.length} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      {activeTab === "all" && (
        <div className="space-y-12">
          {/* Learning Paths Section */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-6">เส้นทางการเรียน</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Empty state - no learning paths yet */}
              <div className="text-center py-8 text-gray-500">
                ยังไม่มีเส้นทางการเรียน
              </div>
            </div>
          </div>

          {/* Courses Section */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-6">คอร์สเรียน</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {courses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "path" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center py-12 text-gray-500 col-span-2">
            ยังไม่มีเส้นทางการเรียน
          </div>
        </div>
      )}

      {activeTab === "course" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      )}
    </>
  );
}

function CourseCard({ course }: { course: ICourse }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          setIsLoggedIn(true);
          // Check if user purchased this course
          const data = await res.json();
          // Assuming user object has purchasedCourses array
          if (data.user?.purchasedCourses?.includes(course._id)) {
            setIsPurchased(true);
          }
        } else {
          setIsLoggedIn(false);
        }
      } catch {
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [course._id]);

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isPurchased) {
      window.location.href = `/courses/${course._id}`;
    } else {
      // Add to cart regardless of login status
      addToCart(course);
    }
  };

  const courseLink = isPurchased ? `/courses/${course._id}` : "#";

  return (
    <Link href={courseLink}>
      <div className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-shadow group flex flex-col h-full">
        {/* Course Image */}
        <div className="relative h-40 bg-gradient-to-br from-indigo-100 to-purple-100 overflow-hidden flex-shrink-0">
          {course.coverImage ? (
            <Image
              src={course.coverImage}
              alt={course.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-4xl">📚</div>
          )}
        </div>

        {/* Course Info */}
        <div className="p-4 flex flex-col flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs px-2 py-1 bg-indigo-50 text-indigo-600 rounded-full font-medium truncate">
              {course.category || "คอร์สเรียน"}
            </span>
          </div>

          <h4 className="font-bold text-gray-900 text-sm mb-3 line-clamp-2">
            {course.title}
          </h4>

          <div className="flex items-center gap-2 mb-3 mt-auto">
            <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 flex-shrink-0">
              {course.instructor[0].toUpperCase()}
            </div>
            <span className="text-xs text-gray-600 truncate">{course.instructor}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
            <div className="flex items-center gap-1">
              <span>👥</span>
              <span>{course.enrollmentCount || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>⏱️</span>
              <span>{course.duration || 0}h</span>
            </div>
            <div className="flex items-center gap-1">
              <span>⭐</span>
              <span>{(course.averageRating || 0).toFixed(1)}</span>
            </div>
          </div>

          {/* Price - Show if not logged in OR logged in but not purchased */}
          {(!isLoggedIn || (isLoggedIn && !isPurchased)) && !loading && (
            <div className="mb-3 text-xl font-bold text-indigo-600">
              ฿{course.price || 0}
            </div>
          )}

          {/* Buttons */}
          {!loading && (
            <div className="flex gap-2">
              {/* Cart Icon Button */}
              <button
                onClick={handleButtonClick}
                className="flex-shrink-0 w-12 h-12 rounded-lg border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center justify-center"
              >
                <ShoppingCart className="w-5 h-5" />
              </button>

              {/* Main Action Button */}
              <button
                onClick={handleButtonClick}
                className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors"
              >
                {isPurchased ? "เริ่มเรียนคอร์สนี้" : "ซื้อคอร์สนี้"}
              </button>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
