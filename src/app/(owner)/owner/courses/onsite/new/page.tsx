import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import CourseForm from "@/components/CourseForm";

export default async function NewOnsiteCoursePassPage() {
  const auth = await getAuthUser();
  if (!auth || (auth.role !== "admin" && auth.role !== "teacher")) redirect("/login");

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">สร้างหลักสูตร Onsite</h1>
        <p className="text-gray-500 text-sm mt-1">คอร์สเรียนที่สอนในสถาบัน</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-8">
        <CourseForm
          mode="create"
          courseType="onsite"
          teacherMode={auth.role === "teacher"}
          teacherName={auth.name}
        />
      </div>
    </div>
  );
}
