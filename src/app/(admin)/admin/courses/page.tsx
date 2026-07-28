"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ICourse } from "@/types";
import Badge from "@/components/ui/Badge";
import { BookOpen, Plus, Pencil, Building2, Globe, Radio, Building2 as Building } from "lucide-react";
import DeleteCourseButton from "./DeleteCourseButton";

type CourseType = "all" | "online" | "live online" | "onsite";

const COURSE_TYPES: { value: CourseType; label: string; icon: React.ComponentType<any>; color: string }[] = [
  { value: "all", label: "ทั้งหมด", icon: BookOpen, color: "gray" },
  { value: "online", label: "คอร์สออนไลน์", icon: Globe, color: "blue" },
  { value: "live online", label: "Live Online", icon: Radio, color: "purple" },
  { value: "onsite", label: "Onsite", icon: Building, color: "orange" },
];

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [selectedType, setSelectedType] = useState<CourseType>("all");
  const [loading, setLoading] = useState(true);
  const [institutionName, setInstitutionName] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch("/api/admin/courses");
        const data = await res.json();
        setCourses(data.courses || []);
        setInstitutionName(data.institutionName || "");
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = selectedType === "all"
    ? courses
    : courses.filter(c => (c.type || "online") === selectedType);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">จัดการคอร์ส</h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-gray-500 text-sm">คอร์สทั้งหมด {courses.length} คอร์ส</p>
            {institutionName && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold theme-badge px-2.5 py-1 rounded-full">
                <Building2 className="w-3 h-3" />
                {institutionName}
              </span>
            )}
          </div>
        </div>
        <Link
          href={
            selectedType === "all"
              ? "/admin/courses/new"
              : `/admin/courses/${selectedType}/new`
          }
          className="flex items-center gap-2 px-4 py-2.5 theme-button text-sm font-medium rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          สร้างคอร์สใหม่
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {COURSE_TYPES.map((type) => (
          <button
            key={type.value}
            onClick={() => setSelectedType(type.value)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              selectedType === type.value
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <type.icon className="w-4 h-4" />
            {type.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">กำลังโหลด...</div>
      ) : filteredCourses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center text-gray-400">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>ยังไม่มีคอร์ส</p>
          <Link href="/admin/courses/new" className="px-4 py-2.5 theme-button text-sm font-medium rounded-xl mt-2 inline-flex items-center gap-2">
            + สร้างคอร์สแรก
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">คอร์ส</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">ประเภท</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">ระดับชั้น</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">รอบ</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">สถานะ</th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredCourses.map((course) => (
                <tr key={course._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-indigo-50 shrink-0">
                        {course.coverImage ? (
                          <Image src={course.coverImage} alt={course.title} fill className="object-cover" />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <BookOpen className="w-5 h-5 text-indigo-300" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 text-sm line-clamp-1">{course.title}</div>
                        <div className="text-xs text-gray-400">{course.instructor}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    {(() => {
                      const type = (course.type || "online") as string;
                      const typeLabel = type === "live online" ? "Live Online" : type === "online" ? "ออนไลน์" : "Onsite";
                      const typeColor = type === "live online" ? "purple" : type === "online" ? "blue" : "orange";
                      return <Badge variant={typeColor as any} className="text-xs">{typeLabel}</Badge>;
                    })()}
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {course.gradeLevels.slice(0, 3).map((g) => (
                        <Badge key={g} className="text-xs">{g}</Badge>
                      ))}
                      {course.gradeLevels.length > 3 && (
                        <Badge className="text-xs">+{course.gradeLevels.length - 3}</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell">
                    <span className="text-sm text-gray-600">{course.sessions.length} รอบ</span>
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant={course.isActive ? "success" : "danger"}>
                      {course.isActive ? "เปิดสอน" : "ปิด"}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/courses/${course._id}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        แก้ไข
                      </Link>
                      <DeleteCourseButton courseId={course._id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
