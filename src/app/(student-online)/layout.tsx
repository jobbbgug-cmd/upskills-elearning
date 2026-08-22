import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getAuthUser } from "@/lib/auth";
import { LogOut, ShoppingCart, BookOpen, FileText, Menu, Package } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";

export default async function StudentOnlineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getAuthUser();
  if (!auth || (auth.role !== "student-online" && auth.role !== "online")) {
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
            <span className="text-sm text-gray-600">นักเรียน {auth.name}</span>
            <LogoutButton />
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <aside className="hidden md:block fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 overflow-y-auto pt-20">
        <nav className="space-y-2 p-4 sticky top-0">
          <Link
            href="/student-dashboard"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            ภาพรวม
          </Link>
          <Link
            href="/student-dashboard/my-courses"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            คอร์สของฉัน
          </Link>
          <Link
            href="/student-dashboard/cart"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            ตะกร้าสินค้า
          </Link>
          <Link
            href="/purchases"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors"
          >
            <Package className="w-4 h-4" />
            การซื้อของฉัน
          </Link>
          <Link
            href="/student-dashboard/invoices"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors"
          >
            <FileText className="w-4 h-4" />
            ใบกำกับภาษี
          </Link>
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
