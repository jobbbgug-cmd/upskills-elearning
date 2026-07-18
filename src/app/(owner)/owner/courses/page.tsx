import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Course from "@/models/Course";
import Institution from "@/models/Institution";
import { ICourse } from "@/types";
import Badge from "@/components/ui/Badge";
import { BookOpen, Plus, Pencil, Building2 } from "lucide-react";
import DeleteCourseButton from "./DeleteCourseButton";

async function getCourses(role: string, userId: string, institutionId?: string) {
  await connectDB();
  const tenantClause = institutionId ? { institutionId } : {};
  const filter = role === "teacher" ? { ...tenantClause, instructorId: userId } : tenantClause;
  const courses = await Course.find(filter).sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(courses)) as ICourse[];
}

export default async function AdminCoursesPage() {
  const auth = await getAuthUser();
  if (!auth || (auth.role !== "admin" && auth.role !== "teacher" && auth.role !== "owner")) redirect("/login");

  const courses = await getCourses(auth.role, auth.userId, auth.institutionId);

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
          <h1 className="text-2xl font-bold text-gray-900">จัดการคอร์ส</h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-gray-500 text-sm">คอร์สทั้งหมด {courses.length} คอร์ส</p>
            {institutionName && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold theme-badge px-2.5 py-1 rounded-full">
                <Building2 className="w-3 h-3" />
                {institutionName}
              </span>
            )}
          </div>
        </div>
        <Link
          href="/owner/courses/new"
          className="flex items-center gap-2 px-4 py-2.5 theme-button text-sm font-medium rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          สร้างคอร์สใหม่
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center text-gray-400">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>ยังไม่มีคอร์ส</p>
          <Link href="/owner/courses/new" className="px-4 py-2.5 theme-button text-sm font-medium rounded-xl mt-2 inline-flex items-center gap-2">
            + สร้างคอร์สแรก
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">คอร์ส</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">ระดับชั้น</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">รอบ</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">สถานะ</th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {courses.map((course) => (
                <tr key={course._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-indigo-50 shrink-0">
                        {course.coverImage ? (
                          <Image src={course.coverImage} alt={course.title} fill className="object-cover" />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <BookOpen className="w-5 h-5 text-indigo-300" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 text-sm line-clamp-1">{course.title}</div>
                        <div className="text-xs text-gray-400">{course.instructor}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {course.gradeLevels.slice(0, 3).map((g) => (
                        <Badge key={g} className="text-xs">{g}</Badge>
                      ))}
                      {course.gradeLevels.length > 3 && (
                        <Badge className="text-xs">+{course.gradeLevels.length - 3}</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell">
                    <span className="text-sm text-gray-600">{course.sessions.length} รอบ</span>
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant={course.isActive ? "success" : "danger"}>
                      {course.isActive ? "เปิดสอน" : "ปิด"}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/owner/courses/${course._id}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        แก้ไข
                      </Link>
                      <DeleteCourseButton courseId={course._id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
