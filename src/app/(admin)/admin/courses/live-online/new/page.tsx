import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import CourseForm from "@/components/CourseForm";

export default async function NewLiveOnlineCoursePassPage() {
  const auth = await getAuthUser();
  if (!auth || (auth.role !== "admin" && auth.role !== "teacher")) redirect("/login");

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">สร้างคอร์สเรียน Live</h1>
        <p className="text-gray-500 text-sm mt-1">คอร์สเรียนสดแบบ Live ในเวลาเฉพาะเจาะจง</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-8">
        <CourseForm
          mode="create"
          courseType="live online"
          teacherMode={auth.role === "teacher"}
          teacherName={auth.name}
        />
      </div>
    </div>
  );
}
