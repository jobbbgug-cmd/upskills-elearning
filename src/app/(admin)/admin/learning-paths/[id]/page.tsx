import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import LearningPath from "@/models/LearningPath";
import { ArrowLeft } from "lucide-react";
import LearningPathForm from "@/components/LearningPathForm";

async function getLearningPath(id: string) {
  await connectDB();
  try {
    const path = await LearningPath.findById(id).populate("courses", "title");
    if (!path) return null;
    return JSON.parse(JSON.stringify(path));
  } catch {
    return null;
  }
}

export default async function EditLearningPathPage({ params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthUser();
  if (!auth || (auth.role !== "admin" && auth.role !== "owner")) redirect("/login");

  const { id } = await params;
  const path = await getLearningPath(id);
  if (!path) notFound();

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/admin/learning-paths"
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          กลับ
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">แก้ไขเส้นทางการเรียน</h1>
        <p className="text-gray-500 text-sm mt-1">{path.title}</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-8">
        <LearningPathForm path={path} mode="edit" />
      </div>
    </div>
  );
}
