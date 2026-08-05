import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";

export default async function TeacherPortalPage() {
  const auth = await getAuthUser();
  if (!auth || auth.role !== "teacher") redirect("/login");

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Teacher Portal</h1>
        <p className="text-gray-600 mt-1">พอร์ทัลครูสำหรับจัดการการสอน</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-8">
        <p className="text-gray-500 text-center py-12">Teacher Portal</p>
      </div>
    </div>
  );
}
