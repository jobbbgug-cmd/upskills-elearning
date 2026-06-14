"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { LayoutDashboard, ListChecks, Users, LogOut, Images, UserCog, UserCheck, BookOpen, TrendingUp, CalendarDays, GraduationCap, Menu, X, Wallet, AlertTriangle, Palette } from "lucide-react";
import { PLAN_LABELS } from "@/lib/planLimits";

interface Subscription {
  plan: string | null;
  planLabel: string;
  planExpiresAt: string | null;
  isActive: boolean;
  isExpired: boolean;
  daysLeft: number | null;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [pendingCount, setPendingCount]       = useState(0);
  const [pendingBookings, setPendingBookings] = useState(0);
  const [role, setRole]                       = useState<string>("");
  const [subscription, setSubscription]       = useState<Subscription | null>(null);
  const [sidebarOpen, setSidebarOpen]         = useState(false);

  useEffect(() => {
    const load = async () => {
      const [usersRes, bookingsRes, meRes, subRes] = await Promise.all([
        fetch("/api/admin/users/pending"),
        fetch("/api/admin/bookings/pending"),
        fetch("/api/auth/me"),
        fetch("/api/auth/subscription"),
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
      if (subRes.ok) {
        const data = await subRes.json();
        setSubscription(data);
      }
    };
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const isAdmin = role === "admin";
  const close = () => setSidebarOpen(false);

  const navLink = (href: string, icon: React.ReactNode, label: React.ReactNode) => (
    <Link href={href} onClick={close}
      className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors">
      {icon}
      {label}
    </Link>
  );

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={close} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-60 bg-white border-r border-gray-200 flex flex-col shrink-0 transition-transform duration-200
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:transform-none`}>

        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <Link href="/" onClick={close}>
            <Image src="/logo.png" alt="UPSkills" width={150} height={50} className="object-contain" />
          </Link>
          <button onClick={close} className="lg:hidden p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navLink("/admin", <LayoutDashboard className="w-4 h-4" />, "ภาพรวม")}
          {navLink("/admin/members", <UserCheck className="w-4 h-4" />,
            <span className="flex items-center justify-between w-full gap-2">
              อนุมัติสมาชิก
              {pendingCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                  {pendingCount}
                </span>
              )}
            </span>
          )}
          {isAdmin && navLink("/admin/users", <UserCog className="w-4 h-4" />, "จัดการผู้ใช้")}
          {navLink("/admin/courses", <ListChecks className="w-4 h-4" />, "จัดการคอร์ส")}
          {navLink("/admin/content", <BookOpen className="w-4 h-4" />, "เนื้อหาการเรียน")}
          {navLink("/admin/schedule", <CalendarDays className="w-4 h-4" />, "ตารางสอน")}
          {navLink("/dashboard/schedule", <GraduationCap className="w-4 h-4" />, "ตารางเรียน")}
          {navLink("/admin/revenue", <TrendingUp className="w-4 h-4" />, "รายได้")}
          {navLink("/admin/bookings", <Users className="w-4 h-4" />,
            <span className="flex items-center justify-between w-full gap-2">
              ตรวจสอบการชำระ
              {pendingBookings > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                  {pendingBookings}
                </span>
              )}
            </span>
          )}
          {isAdmin && navLink("/admin/finance", <Wallet className="w-4 h-4" />, "ข้อมูลทางการเงิน")}
          {isAdmin && navLink("/admin/banners", <Images className="w-4 h-4" />, "จัดการแบนเนอร์")}
          {isAdmin && navLink("/admin/branding", <Palette className="w-4 h-4" />, "จัดการ Branding")}
        </nav>

        {/* Subscription status */}
        {subscription?.plan && (
          <div className="mx-3 mb-2">
            <div className={`rounded-xl p-3 text-xs ${
              !subscription.isActive || subscription.isExpired
                ? "bg-red-50 border border-red-200"
                : subscription.daysLeft !== null && subscription.daysLeft <= 7
                ? "bg-orange-50 border border-orange-200"
                : "bg-indigo-50 border border-indigo-100"
            }`}>
              <div className="flex items-center gap-1.5 font-semibold mb-0.5 text-gray-700">
                {(!subscription.isActive || subscription.isExpired || (subscription.daysLeft !== null && subscription.daysLeft <= 7)) && (
                  <AlertTriangle className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                )}
                {PLAN_LABELS[subscription.plan] ?? subscription.plan}
              </div>
              {subscription.isExpired && <p className="text-red-600">แผนหมดอายุแล้ว</p>}
              {!subscription.isActive && <p className="text-red-600">สถาบันถูกระงับ</p>}
              {subscription.daysLeft !== null && !subscription.isExpired && subscription.daysLeft <= 7 && (
                <p className="text-orange-600">หมดอายุใน {subscription.daysLeft} วัน</p>
              )}
              {subscription.daysLeft !== null && !subscription.isExpired && subscription.daysLeft > 7 && (
                <p className="text-gray-500">เหลือ {subscription.daysLeft} วัน</p>
              )}
              {subscription.daysLeft === null && <p className="text-gray-500">ไม่มีวันหมดอายุ</p>}
            </div>
          </div>
        )}

        <div className="p-3 border-t border-gray-100">
          <Link href="/" onClick={close}
            className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors">
            <LogOut className="w-4 h-4" />
            กลับหน้าหลัก
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto min-w-0">
        {/* Mobile topbar */}
        <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/">
            <Image src="/logo.png" alt="UPSkills" width={100} height={34} className="object-contain" />
          </Link>
        </div>

        {/* Suspended / expired banner */}
        {subscription && (!subscription.isActive || subscription.isExpired) && (
          <div className={`px-4 py-3 flex items-center gap-3 text-sm ${
            !subscription.isActive ? "bg-red-500 text-white" : "bg-orange-500 text-white"
          }`}>
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {!subscription.isActive
              ? "สถาบันของคุณถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ"
              : "แผนสมาชิกของคุณหมดอายุแล้ว กรุณาต่ออายุเพื่อใช้งานต่อ"}
          </div>
        )}
        <div className="max-w-6xl mx-auto p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
