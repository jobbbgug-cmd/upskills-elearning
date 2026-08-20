import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import LearningPath from "@/models/LearningPath";
import Link from "next/link";
import { Plus, Layers, Edit2, Trash2 } from "lucide-react";

interface LearningPathItem {
  _id: string;
  title: string;
  description: string;
  coverImage?: string;
  instructor: string;
  difficulty: string;
  courses: any[];
  createdAt: string;
}

async function getLearningPaths(userId?: string): Promise<LearningPathItem[]> {
  try {
    await connectDB();
    const paths = await LearningPath.find({
      isActive: true,
    })
      .select("title description coverImage instructor difficulty courses createdAt")
      .sort({ createdAt: -1 })
      .populate("courses", "title")
      .lean();
    return JSON.parse(JSON.stringify(paths));
  } catch (error) {
    console.error("Error fetching learning paths:", error);
    return [];
  }
}

export default async function ManagePathsPage() {
  const auth = await getAuthUser();
  if (!auth || (auth.role !== "teacher-online" && auth.role !== "teacher_online")) {
    redirect("/login");
  }

  const paths = await getLearningPaths(auth.userId);

  const handleDelete = async (id: string) => {
    "use server";
    try {
      await connectDB();
      await LearningPath.findByIdAndDelete(id);
    } catch (error) {
      console.error("Error deleting path:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">เส้นทางการเรียน</h1>
          <p className="text-gray-500 text-sm mt-1">จัดการเส้นทางการเรียนที่รวมหลายคอร์ส</p>
        </div>
        <Link href="/manage-paths/create" className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
          <Plus className="w-4 h-4" />
          สร้างเส้นทาง
        </Link>
      </div>

      {paths.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <Layers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">คุณยังไม่มีเส้นทางการเรียนใดๆ</p>
          <Link href="/manage-paths/create" className="inline-flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
            <Plus className="w-4 h-4" />
            สร้างเส้นทางแรก
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">ชื่อเส้นทาง</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">จำนวนคอร์ส</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">ระดับความยาก</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">วันที่สร้าง</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {paths.map((path) => (
                  <tr key={path._id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{path.title}</p>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-1">{path.description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {path.courses.length} คอร์ส
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {path.difficulty === "easy" ? "ผู้เริ่มต้น" : path.difficulty === "intermediate" ? "ระดับกลาง" : "ขั้นสูง"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(path.createdAt).toLocaleDateString("th-TH")}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/manage-paths/${path._id}/edit`}
                          className="inline-flex items-center gap-1 px-3 py-1 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                          แก้ไข
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
