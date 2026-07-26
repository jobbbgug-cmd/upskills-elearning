import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";

export default async function TeacherDashboardPage() {
  const auth = await getAuthUser();
  if (!auth || auth.role !== "teacher") redirect("/login");

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">สวัสดีค่ะ, {auth.name}</h1>
        <p className="text-gray-600 mt-1">ยินดีต้อนรับเข้าสู่ Teacher Dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Quick Stats */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">นักเรียน</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">คอร์สเรียน</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <span className="text-2xl">📚</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">รายได้</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">฿0</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Live Class</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
              <span className="text-2xl">🔴</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
