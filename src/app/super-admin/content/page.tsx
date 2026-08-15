import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import CourseContent from "@/models/CourseContent";
import Institution from "@/models/Institution";
import { ICourseContent } from "@/types";
import Image from "next/image";
import { Plus, Pencil, BookOpen, Building2 } from "lucide-react";
import DeleteContentButton from "./DeleteContentButton";

async function getContents(institutionId?: string): Promise<ICourseContent[]> {
  await connectDB();
  const filter = institutionId ? { institutionId } : {};
  const contents = await CourseContent.find(filter).sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(contents));
}

export default async function ContentListPage() {
  const auth = await getAuthUser();
  if (!auth || (auth.role !== "admin" && auth.role !== "teacher")) redirect("/login");

  const contents = await getContents(auth.institutionId);

  let institutionName = "";
  if (auth.institutionId) {
    await connectDB();
    const inst = await Institution.findById(auth.institutionId).select("name").lean() as { name: string } | null;
    institutionName = inst?.name ?? "";
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">จัดการเนื้อหาการเรียน</h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-gray-500 text-sm">สร้างชุดเนื้อหาและนำไปใช้กับคอร์สที่ต้องการ</p>
            {institutionName && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold theme-badge px-2.5 py-1 rounded-full">
                <Building2 className="w-3 h-3" />
                {institutionName}
              </span>
            )}
          </div>
        </div>
        <Link
          href="/admin/content/new"
          className="flex items-center gap-2 px-4 py-2.5 theme-button text-sm font-semibold rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          สร้างชุดเนื้อหาใหม่
        </Link>
      </div>

      {contents.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">ยังไม่มีชุดเนื้อหา</p>
          <p className="text-gray-400 text-sm mt-1">กด &quot;สร้างชุดเนื้อหาใหม่&quot; เพื่อเริ่มต้น</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {contents.map((c) => {
            const total =
              (c.smartPpts?.length ?? 0) +
              (c.teachingClips?.length ?? 0) +
              (c.summaryClips?.length ?? 0) +
              (c.downloadFree?.length ?? 0) +
              (c.downloadTeacherCard?.length ?? 0) +
              (c.downloadAksorn?.length ?? 0);

            return (
              <div key={c._id} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
                <div className="w-12 h-16 overflow-hidden shrink-0 bg-green-100 rounded flex items-center justify-center">
                  {c.ebookCoverUrl ? (
                    <Image src={c.ebookCoverUrl} alt={c.name} width={48} height={64} className="w-full h-full object-contain" />
                  ) : (
                    <BookOpen className="w-6 h-6 text-green-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900 truncate">{c.name}</h3>
                  </div>
                  {c.description && (
                    <p className="text-sm text-gray-500 truncate mt-0.5">{c.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(c.smartPpts?.length ?? 0) > 0 && (
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                        PPT {c.smartPpts!.length} ชุด
                      </span>
                    )}
                    {(c.teachingClips?.length ?? 0) > 0 && (
                      <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
                        คลิปสอน {c.teachingClips!.length} คลิป
                      </span>
                    )}
                    {(c.summaryClips?.length ?? 0) > 0 && (
                      <span className="text-xs bg-pink-50 text-pink-700 px-2 py-0.5 rounded-full">
                        คลิปสรุป {c.summaryClips!.length} คลิป
                      </span>
                    )}
                    {((c.downloadFree?.length ?? 0) + (c.downloadTeacherCard?.length ?? 0) + (c.downloadAksorn?.length ?? 0)) > 0 && (
                      <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                        ดาวน์โหลด {(c.downloadFree?.length ?? 0) + (c.downloadTeacherCard?.length ?? 0) + (c.downloadAksorn?.length ?? 0)} ไฟล์
                      </span>
                    )}
                    {total === 0 && (
                      <span className="text-xs text-gray-400 italic">ยังไม่มีเนื้อหา</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/admin/content/${c._id}`}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm theme-link rounded-lg transition-colors font-medium hover:bg-gray-100"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    แก้ไข
                  </Link>
                  {auth.role === "admin" && (
                    <DeleteContentButton id={c._id} name={c.name} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
