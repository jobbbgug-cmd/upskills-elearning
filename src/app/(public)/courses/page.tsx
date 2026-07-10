import { connectDB } from "@/lib/mongodb";
import Course from "@/models/Course";
import Institution from "@/models/Institution";
import { getAuthUser } from "@/lib/auth";
import { ICourse, GradeLevel } from "@/types";
import Link from "next/link";
import Image from "next/image";
import { Search, ChevronDown } from "lucide-react";

const GRADE_GROUPS = [
  { label: "ประถม", grades: ["ป.1", "ป.2", "ป.3", "ป.4", "ป.5", "ป.6"] as GradeLevel[] },
  { label: "มัธยมต้น", grades: ["ม.1", "ม.2", "ม.3"] as GradeLevel[] },
  { label: "มัธยมปลาย", grades: ["ม.4", "ม.5", "ม.6"] as GradeLevel[] },
  { label: "อาชีวะ/ม.เปิด", grades: ["ปวช.", "ปวส.", "มหาวิทยาลัย", "ทั่วไป"] as GradeLevel[] },
];

const ALL_GRADE_LEVELS: GradeLevel[] = GRADE_GROUPS.flatMap((g) => g.grades);

interface IInstitutionItem {
  _id: string;
  name: string;
}

async function getCourses() {
  await connectDB();
  const courses = await Course.find({ isActive: true }).sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(courses)) as ICourse[];
}

async function getCategories() {
  await connectDB();
  const categories = await Course.distinct("category", { isActive: true });
  return categories as string[];
}

export default async function CoursesPage() {
  const [auth, courses, categories] = await Promise.all([getAuthUser(), getCourses(), getCategories()]);

  const FILTER_CATEGORIES = [
    { name: "AI & Automation", count: courses.filter((c) => c.category === "AI & Automation").length },
    { name: "การติดตอออนไลน์", count: courses.filter((c) => c.category === "การติดตอออนไลน์").length },
    { name: "ธุรกิจ", count: courses.filter((c) => c.category === "ธุรกิจ").length },
    ...categories.filter((c) => !["AI & Automation", "การติดตอออนไลน์", "ธุรกิจ"].includes(c)).map((c) => ({
      name: c,
      count: courses.filter((course) => course.category === c).length,
    })),
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">คอร์สทั้งหมด</h1>

          {/* Search Bar */}
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหา"
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
              <h3 className="font-bold text-gray-900 mb-4">หมวดหมู่ ({FILTER_CATEGORIES.length})</h3>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {FILTER_CATEGORIES.map((cat) => (
                  <Link
                    key={cat.name}
                    href={`/courses?category=${encodeURIComponent(cat.name)}`}
                    className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors group"
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded cursor-pointer"
                        readOnly
                      />
                      <span className="text-sm text-gray-700 group-hover:text-indigo-600">{cat.name}</span>
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-300" />
                  </Link>
                ))}
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
            <div className="mb-8 flex gap-6 border-b border-gray-200 pb-4">
              {[
                { id: "all", label: `ทั้งหมด (${courses.length})` },
                { id: "path", label: "เส้นทางการเรียน (0)" },
                { id: "course", label: `คอร์สเรียน (${courses.length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  className="font-medium text-sm pb-2 transition-colors border-b-2 border-indigo-600 text-indigo-600"
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Courses Grid */}
            {courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {courses.map((course) => (
                  <Link key={course._id} href={`/courses/${course._id}`}>
                    <div className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-shadow group">
                      {/* Course Image */}
                      <div className="relative h-48 bg-gradient-to-br from-indigo-100 to-purple-100 overflow-hidden">
                        {course.coverImage ? (
                          <Image
                            src={course.coverImage}
                            alt={course.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <span className="text-5xl">📚</span>
                          </div>
                        )}
                      </div>

                      {/* Course Info */}
                      <div className="p-5">
                        <h3 className="font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-indigo-600">
                          {course.title}
                        </h3>

                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>

                        {/* Instructor */}
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-600">
                            {course.instructor[0]}
                          </div>
                          <span className="text-xs text-gray-600">{course.instructor}</span>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-4 text-xs text-gray-500 py-3 border-t border-gray-100">
                          <div>📚 {course.sessions?.length ?? 0} lessons</div>
                          <div>⏱️ {Math.floor(Math.random() * 50) + 5}h</div>
                          <div>⭐ {(Math.random() * 2 + 3).toFixed(1)}</div>
                        </div>

                        {/* CTA */}
                        <button className="w-full mt-4 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors">
                          เรียนเลย
                        </button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">ไม่พบคอร์สในหมวดหมู่นี้</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
