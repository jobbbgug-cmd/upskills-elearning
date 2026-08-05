import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Course from "@/models/Course";
import { ICourse } from "@/types";
import CourseForm from "@/components/CourseForm";
import { ArrowLeft } from "lucide-react";

async function getCourse(id: string): Promise<ICourse | null> {
  await connectDB();
  try {
    const course = await Course.findById(id).lean();
    if (!course) return null;
    return JSON.parse(JSON.stringify(course)) as ICourse;
  } catch {
    return null;
  }
}

export default async function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthUser();
  if (!auth || (auth.role !== "admin" && auth.role !== "teacher" && auth.role !== "owner")) redirect("/login");

  const { id } = await params;
  const course = await getCourse(id);
  if (!course) notFound();

  // Teacher can only edit their own courses
  if (auth.role === "teacher" && course.instructorId !== auth.userId) redirect("/admin/courses");

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/admin/courses"
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          กลับ
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">แก้ไขคอร์ส</h1>
        <p className="text-gray-500 text-sm mt-1">{course.title}</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-8">
        <CourseForm
          course={course}
          mode="edit"
          courseType={(course.type || "online") as "online" | "live online" | "onsite"}
          teacherMode={auth.role === "teacher"}
          teacherName={auth.name}
        />
      </div>
    </div>
  );
}
