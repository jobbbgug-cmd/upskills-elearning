import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getAuthUser } from "@/lib/auth";
import { LogOut, BookOpen, FileText, Users, Award, Menu, Layers, BarChart3 } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 py-4 flex items-center justify-between">
        <div className="w-64 hidden md:flex items-center">
          <Link href="/" className="flex items-center gap-2 px-4">
            <Image src="/logo.png" alt="UPSkills" width={120} height={40} className="object-contain" />
          </Link>
        </div>
        <div className="px-4 md:px-8 flex-1 md:ml-0 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 md:hidden">
            <Image src="/logo.png" alt="UPSkills" width={120} height={40} className="object-contain" />
          </Link>
          <div className="flex-1"></div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">ครู {auth.name}</span>
            <LogoutButton />
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <aside className="hidden md:block fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 overflow-y-auto pt-20">
        <nav className="space-y-2 p-4 sticky top-0">
          <Link
            href="/teacher-dashboard"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            ภาพรวม
          </Link>
          <Link
            href="/my-sales"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors"
          >
            <Users className="w-4 h-4" />
            คอร์สของฉัน
          </Link>
          <Link
            href="/invoice-requests"
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
              href="/manage-courses"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              จัดการคอร์ส
            </Link>
            <Link
              href="/manage-content"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors"
            >
              <FileText className="w-4 h-4" />
              เนื้อหาการเรียน
            </Link>
            <Link
              href="/manage-paths"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors"
            >
              <Layers className="w-4 h-4" />
              เส้นทางการเรียน
            </Link>
            <Link
              href="/manage-certificates"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors"
            >
              <Award className="w-4 h-4" />
              ใบรับรอง
            </Link>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 px-4 md:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
