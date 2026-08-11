import { connectDB } from "@/lib/mongodb";
import Course from "@/models/Course";
import Category from "@/models/Category";
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

  try {
    // Use aggregation with $lookup to resolve category references
    const courses = await Course.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: "categories",
          let: { catId: "$category" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$catId"] }
              }
            }
          ],
          as: "categoryData"
        }
      },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          coverImage: 1,
          type: 1,
          instructor: 1,
          price: 1,
          enrollmentCount: 1,
          duration: 1,
          difficulty: 1,
          category: 1,
          categoryData: 1
        }
      }
    ]);

    // Map to include categoryName
    const result = courses.map((course: any) => {
      let categoryName = null;

      if (course.category) {
        if (typeof course.category === "string") {
          // Category is already a string
          categoryName = course.category;
        } else if (course.categoryData && course.categoryData.length > 0) {
          // Category was resolved via $lookup
          categoryName = course.categoryData[0].name;
        } else if (typeof course.category === "object" && course.category.name) {
          // Fallback for populated objects
          categoryName = course.category.name;
        }
      }

      return {
        ...course,
        categoryName: categoryName || null
      };
    });

    return JSON.parse(JSON.stringify(result)) as (ICourse & { categoryName?: string })[];
  } catch (error) {
    console.error("Error fetching courses:", error);
    // Fallback: get courses without category
    try {
      const fallbackCourses = await Course.find({ isActive: true })
        .select("_id title description coverImage type instructor price enrollmentCount duration category")
        .lean()
        .exec();

      return fallbackCourses.map((course: any) => ({
        ...course,
        categoryName: typeof course.category === "string" ? course.category : null
      }));
    } catch {
      return [];
    }
  }
}

export default async function CoursesPage() {
  const [auth, courses] = await Promise.all([getAuthUser(), getCourses()]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">คอร์สทั้งหมด</h1>
        </div>

        {/* Tabbed Content */}
        <CoursesTabbed courses={courses} />
      </div>
    </div>
  );
}
