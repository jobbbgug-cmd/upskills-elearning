import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getAuthUser } from "@/lib/auth";
import { LayoutDashboard, LogOut, BookOpen, FileText, Menu, X } from "lucide-react";
import { useState } from "react";

export default async function OnlineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getAuthUser();
  if (!auth || auth.role !== "online") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="UPSkills" width={120} height={40} className="object-contain" />
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{auth.name}</span>
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

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <Link
            href="/courses-of-mine"
            className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 border-b-2 border-transparent hover:border-purple-600 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            คอร์สของฉัน
          </Link>
          <Link
            href="/tax-invoice"
            className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 border-b-2 border-transparent hover:border-purple-600 transition-colors"
          >
            <FileText className="w-4 h-4" />
            ใบกำกับภาษี
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 border-b-2 border-transparent hover:border-purple-600 transition-colors ml-auto"
          >
            <LayoutDashboard className="w-4 h-4" />
            หน้าหลัก
          </Link>
        </div>

        {/* Page Content */}
        {children}
      </div>
    </div>
  );
}
