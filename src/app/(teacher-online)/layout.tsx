import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getAuthUser } from "@/lib/auth";
import { LogOut, BookOpen, FileText, Users, Award, Menu, Layers, BarChart3 } from "lucide-react";

export default async function TeacherOnlineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getAuthUser();
  if (!auth || (auth.role !== "teacher-online" && auth.role !== "teacher_online")) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="UPSkills" width={120} height={40} className="object-contain" />
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">ครู {auth.name}</span>
            <Link
              href="/api/auth/logout"
              className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              ออกจากระบบ
            </Link>
          </div>
        </div>
      </div>

      {/* Sidebar + Main */}
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Sidebar */}
        <aside className="md:col-span-1">
          <nav className="space-y-2 sticky top-20">
            <Link
              href="/teacher-online/teacher-dashboard"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              ภาพรวม
            </Link>
            <Link
              href="/teacher-online/my-sales"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors"
            >
              <Users className="w-4 h-4" />
              คอร์สของฉัน
            </Link>
            <Link
              href="/teacher-online/invoice-requests"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors"
            >
              <FileText className="w-4 h-4" />
              ใบกำกับภาษี
            </Link>

            <div className="pt-4 border-t border-gray-200 mt-4">
              <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                คอร์สและเนื้อหา
              </p>
              <Link
                href="/teacher-online/manage-courses"
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                จัดการคอร์ส
              </Link>
              <Link
                href="/teacher-online/manage-content"
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors"
              >
                <FileText className="w-4 h-4" />
                เนื้อหาการเรียน
              </Link>
              <Link
                href="/teacher-online/manage-paths"
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors"
              >
                <Layers className="w-4 h-4" />
                เส้นทางการเรียน
              </Link>
              <Link
                href="/teacher-online/manage-certificates"
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors"
              >
                <Award className="w-4 h-4" />
                ใบรับรอง
              </Link>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="md:col-span-4">
          {children}
        </main>
      </div>
    </div>
  );
}
