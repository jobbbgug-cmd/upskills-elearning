import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { tenantFilter } from "@/lib/tenant";
import LearningPath from "@/models/LearningPath";
import Link from "next/link";
import { Plus } from "lucide-react";
import LearningPathsTable from "@/components/LearningPathsTable";

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

async function getLearningPaths(institutionId?: string): Promise<LearningPathItem[]> {
  try {
    await connectDB();
    const paths = await LearningPath.find({
      ...tenantFilter(institutionId),
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

      <LearningPathsTable paths={paths} />
    </div>
  );
}
