import { connectDB } from "@/lib/mongodb";
import Course from "@/models/Course";
import { getAuthUser } from "@/lib/auth";
import { ICourse, GradeLevel } from "@/types";
import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import CoursesTabbed from "./CoursesTabbed";

const GRADE_GROUPS = [
  { label: "ประถม", grades: ["ป.1", "ป.2", "ป.3", "ป.4", "ป.5", "ป.6"] as GradeLevel[] },
  { label: "มัธยมต้น", grades: ["ม.1", "ม.2", "ม.3"] as GradeLevel[] },
  { label: "มัธยมปลาย", grades: ["ม.4", "ม.5", "ม.6"] as GradeLevel[] },
  { label: "อาชีวะ/ม.เปิด", grades: ["ปวช.", "ปวส.", "มหาวิทยาลัย", "ทั่วไป"] as GradeLevel[] },
];

const ALL_GRADE_LEVELS: GradeLevel[] = GRADE_GROUPS.flatMap((g) => g.grades);

async function getCourses() {
  await connectDB();
  const courses = await Course.find({ isActive: true })
    .sort({ createdAt: -1 })
    .lean();

  // Map courses and fetch category names
  const courseIds = courses.map(c => c._id);
  const categories = await Course.collection.db.collection("categories").find({}).toArray();
  const categoryMap = new Map(categories.map(cat => [cat._id?.toString(), cat.name]));

  return JSON.parse(JSON.stringify(courses.map(course => ({
    ...course,
    categoryName: typeof course.category === "string" && categoryMap.has(course.category)
      ? categoryMap.get(course.category)
      : null
  })))) as (ICourse & { categoryName?: string })[];
}

export default async function CoursesPage() {
  const [auth, courses] = await Promise.all([getAuthUser(), getCourses()]);

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

        {/* Tabbed Content */}
        <CoursesTabbed courses={courses} />
      </div>
    </div>
  );
}
