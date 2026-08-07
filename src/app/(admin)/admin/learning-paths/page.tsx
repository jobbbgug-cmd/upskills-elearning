import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { tenantFilter } from "@/lib/tenant";
import LearningPath from "@/models/LearningPath";
import Link from "next/link";
import { Plus, Edit } from "lucide-react";

interface LearningPathItem {
  _id: string;
  title: string;
  description: string;
  instructor: string;
  difficulty: string;
  courses: any[];
  createdAt: string;
}

async function getLearningPaths(institutionId?: string): Promise<LearningPathItem[]> {
  try {
    await connectDB();
    const paths = await LearningPath.find({
      ...tenantFilter(institutionId),
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .populate("courses", "title")
      .lean();
    return JSON.parse(JSON.stringify(paths));
  } catch (error) {
    console.error("Error fetching learning paths:", error);
    return [];
  }
}

export default async function LearningPathsPage() {
  const auth = await getAuthUser();
  if (!auth || (auth.role !== "admin" && auth.role !== "teacher" && auth.role !== "owner")) redirect("/login");

  const paths = await getLearningPaths(auth.institutionId);

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

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {paths.length === 0 ? (
          <div className="text-center py-12 p-8">
            <p className="text-gray-600 mb-4">ยังไม่มีเส้นทางการเรียน</p>
            <Link href="/admin/learning-paths/new" className="inline-block theme-link font-medium">
              สร้างเส้นทางแรก →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">ชื่อเส้นทาง</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">ผู้สอน</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">จำนวนคอร์ส</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">ระดับ</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">การดำเนิน</th>
                </tr>
              </thead>
              <tbody>
                {paths.map((path) => (
                  <tr key={path._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{path.title}</p>
                        <p className="text-sm text-gray-600 line-clamp-1">{path.description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{path.instructor}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{path.courses?.length || 0}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        path.difficulty === "beginner" ? "bg-green-100 text-green-700" :
                        path.difficulty === "intermediate" ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {path.difficulty === "beginner" ? "ระดับเบื้องต้น" :
                         path.difficulty === "intermediate" ? "ระดับกลาง" : "ระดับสูง"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/admin/learning-paths/${path._id}`} className="p-1.5 hover:bg-indigo-100 rounded text-indigo-600 transition-colors inline-flex">
                        <Edit className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
