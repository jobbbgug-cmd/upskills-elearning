import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthUser } from "@/lib/auth";
import ContentForm from "@/components/ContentForm";
import { ArrowLeft } from "lucide-react";

export default async function CreateContentPage({ params }: { params: Promise<{ type: string }> }) {
  const auth = await getAuthUser();
  if (!auth || (auth.role !== "admin" && auth.role !== "teacher")) redirect("/login");

  const { type } = await params;
  const validTypes = ["online", "live-online", "onsite"];

  if (!validTypes.includes(type)) {
    redirect("/admin/content");
  }

  const typeLabel: Record<string, string> = {
    "online": "คอร์สออนไลน์",
    "live-online": "Live Online",
    "onsite": "Onsite",
  };

  const typeValue = type === "live-online" ? "live online" : type;

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/admin/content"
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          ย้อนกลับ
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">สร้างชุดเนื้อหา</h1>
          <span className="text-sm font-medium px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full">
            {typeLabel[type]}
          </span>
        </div>
        <p className="text-gray-500 text-sm mt-1">เพิ่ม PPT, คลิป และไฟล์ดาวน์โหลดสำหรับใช้กับคอร์ส</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-8">
        <ContentForm mode="create" defaultType={typeValue as "online" | "live online" | "onsite"} lockType />
      </div>
    </div>
  );
}
