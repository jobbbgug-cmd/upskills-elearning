import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function LearningPathsPage() {
  const auth = await getAuthUser();
  if (!auth || (auth.role !== "admin" && auth.role !== "teacher" && auth.role !== "owner")) redirect("/login");

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">เส้นทางการเรียน</h1>
          <p className="text-gray-500 text-sm mt-1">จัดการเส้นทางการเรียนที่รวมหลายคอร์ส</p>
        </div>
        <Link href="/admin/learning-paths/new" className="flex items-center gap-2 px-4 py-2.5 theme-btn rounded-lg transition-colors font-medium text-sm">
          <Plus className="w-4 h-4" />
          สร้างเส้นทาง
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-8">
        <div className="text-center py-12">
          <p className="text-gray-600">ยังไม่มีเส้นทางการเรียน</p>
          <Link href="/admin/learning-paths/new" className="mt-4 inline-block theme-link font-medium">
            สร้างเส้นทางแรก →
          </Link>
        </div>
      </div>
    </div>
  );
}
