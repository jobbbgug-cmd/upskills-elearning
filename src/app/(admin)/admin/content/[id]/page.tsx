import { redirect, notFound } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import CourseContent from "@/models/CourseContent";
import { ICourseContent } from "@/types";
import ContentForm from "@/components/ContentForm";

async function getContent(id: string): Promise<ICourseContent | null> {
  await connectDB();
  try {
    const content = await CourseContent.findById(id).lean();
    if (!content) return null;
    return JSON.parse(JSON.stringify(content)) as ICourseContent;
  } catch {
    return null;
  }
}

export default async function EditContentPage({ params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthUser();
  if (!auth || (auth.role !== "admin" && auth.role !== "teacher" && auth.role !== "owner")) redirect("/login");

  const { id } = await params;
  const content = await getContent(id);
  if (!content) notFound();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">แก้ไขชุดเนื้อหา</h1>
        <p className="text-gray-500 text-sm mt-1">{content.name}</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-8">
        <ContentForm content={content} mode="edit" />
      </div>
    </div>
  );
}
