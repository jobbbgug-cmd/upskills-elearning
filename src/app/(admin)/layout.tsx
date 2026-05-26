"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { LayoutDashboard, ListChecks, Users, LogOut, Images, UserCog, UserCheck } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [pendingCount, setPendingCount]       = useState(0);
  const [pendingBookings, setPendingBookings] = useState(0);
  const [role, setRole]                       = useState<string>("");

  useEffect(() => {
    const load = async () => {
      const [usersRes, bookingsRes, meRes] = await Promise.all([
        fetch("/api/admin/users/pending"),
        fetch("/api/admin/bookings/pending"),
        fetch("/api/auth/me"),
      ]);
      if (usersRes.ok) {
        const data = await usersRes.json();
        setPendingCount(Array.isArray(data) ? data.length : 0);
      }
      if (bookingsRes.ok) {
        const data = await bookingsRes.json();
        setPendingBookings(data.count ?? 0);
      }
      if (meRes.ok) {
        const data = await meRes.json();
        setRole(data.user?.role ?? "");
      }
    };
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const isAdmin = role === "admin";

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="p-5 border-b border-gray-100">
          <Link href="/">
            <Image src="/logo.png" alt="UPSkills" width={150} height={50} className="object-contain" />
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors">
            <LayoutDashboard className="w-4 h-4" />
            ภาพรวม
          </Link>
          <Link href="/admin/members" className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors">
            <UserCheck className="w-4 h-4" />
            <span className="flex-1">อนุมัติสมาชิก</span>
            {pendingCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                {pendingCount}
              </span>
            )}
          </Link>
          {isAdmin && (
            <Link href="/admin/users" className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors">
              <UserCog className="w-4 h-4" />
              จัดการผู้ใช้
            </Link>
          )}
          <Link href="/admin/courses" className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors">
            <ListChecks className="w-4 h-4" />
            จัดการคอร์ส
          </Link>
          <Link href="/admin/bookings" className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors">
            <Users className="w-4 h-4" />
            <span className="flex-1">ตรวจสอบการชำระ</span>
            {pendingBookings > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                {pendingBookings}
              </span>
            )}
          </Link>
          {isAdmin && (
            <Link href="/admin/banners" className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors">
              <Images className="w-4 h-4" />
              จัดการแบนเนอร์
            </Link>
          )}
        </nav>
        <div className="p-3 border-t border-gray-100">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors">
            <LogOut className="w-4 h-4" />
            กลับหน้าหลัก
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-8">{children}</div>
      </main>
    </div>
  );
}
