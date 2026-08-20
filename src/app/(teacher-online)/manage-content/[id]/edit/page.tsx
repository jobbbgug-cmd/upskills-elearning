import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthUser } from "@/lib/auth";
import ContentForm from "@/components/ContentForm";
import { ArrowLeft } from "lucide-react";

export default async function EditContentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const auth = await getAuthUser();
  if (!auth || (auth.role !== "teacher-online" && auth.role !== "teacher_online")) {
    redirect("/login");
  }

  const { id } = await params;

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/manage-content"
          className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          กลับ
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">แก้ไขเนื้อหาการเรียน</h1>
        <p className="text-gray-500 text-sm mt-1">อัปเดตเนื้อหาการเรียนของคุณ</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-8">
        <ContentForm
          mode="edit"
          contentId={id}
          teacherMode={true}
          redirectUrl="/manage-content"
        />
      </div>
    </div>
  );
}
