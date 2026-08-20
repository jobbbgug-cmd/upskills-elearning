import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthUser } from "@/lib/auth";
import CourseForm from "@/components/CourseForm";
import { ArrowLeft } from "lucide-react";

export default async function CreateCoursePage() {
  const auth = await getAuthUser();
  if (!auth || (auth.role !== "teacher-online" && auth.role !== "teacher_online")) {
    redirect("/login");
  }

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/manage-courses"
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          กลับ
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">สร้างคอร์สออนไลน์</h1>
        <p className="text-gray-500 text-sm mt-1">คอร์สเรียนออนไลน์</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-8">
        <CourseForm
          mode="create"
          courseType="online"
          teacherMode={true}
          teacherName={auth.name}
          redirectUrl="/manage-courses"
        />
      </div>
    </div>
  );
}
