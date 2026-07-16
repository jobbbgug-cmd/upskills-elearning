import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import ContentForm from "@/components/ContentForm";

export default async function NewContentPage() {
  const auth = await getAuthUser();
  if (!auth || (auth.role !== "admin" && auth.role !== "teacher" && auth.role !== "owner")) redirect("/login");

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">สร้างชุดเนื้อหาใหม่</h1>
        <p className="text-gray-500 text-sm mt-1">เพิ่ม PPT, คลิป และไฟล์ดาวน์โหลดสำหรับใช้กับคอร์ส</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-8">
        <ContentForm mode="create" />
      </div>
    </div>
  );
}
