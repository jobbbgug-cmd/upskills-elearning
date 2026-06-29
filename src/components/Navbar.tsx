"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X, User, LogOut, LayoutDashboard, CalendarDays, ShieldCheck, BookOpen, ClipboardCheck, PenLine, Award, Radio, Receipt, MessageSquare, Star, BarChart2, Building2, Users as UsersIcon, Wallet, Tag, Settings, ChevronDown } from "lucide-react";
import NotificationBell from "@/components/NotificationBell";
import { IUser, IBranding } from "@/types";
import TrialRequestModal from "@/components/TrialRequestModal";

export default function Navbar() {
  const [user, setUser]               = useState<IUser | null>(null);
  const [branding, setBranding]       = useState<IBranding | null>(null);
  const [menuOpen, setMenuOpen]       = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [superAdminDropdown, setSuperAdminDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router   = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setIsNavigating(false);
    setMenuOpen(false);
    setSuperAdminDropdown(false);
  }, [pathname]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSuperAdminDropdown(false);
      }
    };
    if (superAdminDropdown) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [superAdminDropdown]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        const u = d.user ?? null;
        if (u) setUser(u);
        const qs = u?.institutionId ? `?institutionId=${u.institutionId}` : "";
        return fetch(`/api/branding${qs}`)
          .then((r) => r.json())
          .then((bd) => setBranding(bd));
      })
      .catch(() => {});
  }, []);

  const logout = async () => {
    await fetch("/api/auth/me", { method: "DELETE" });
    setUser(null);
    router.push("/");
    router.refresh();
  };

  return (
    <nav
      className="sticky top-0 z-50 bg-white border-b border-gray-200"
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("a[href]")) setIsNavigating(true);
      }}
    >
      {isNavigating && (
        <div className="absolute top-0 left-0 right-0 z-[9999] h-[2px] overflow-hidden">
          <div className="h-full w-[30%] bg-gradient-to-r from-indigo-400 to-indigo-600"
            style={{ animation: "nav-progress 0.8s ease infinite" }} />
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">

          {/* Left: logo + nav links */}
          <div className="flex items-center gap-8">
            <Link href="/">
              {branding?.logoUrl ? (
                <Image
                  src={branding.logoUrl}
                  alt={branding.name || "Logo"}
                  width={120}
                  height={40}
                  className="object-contain h-8 w-auto"
                  priority
                />
              ) : branding && !branding.isDefault && branding.name ? (
                <span className="font-bold text-lg text-indigo-700">
                  {branding.name}
                </span>
              ) : (
                <Image
                  src="/logo.png"
                  alt="UPSkills"
                  width={120}
                  height={40}
                  className="object-contain"
                  priority
                />
              )}
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link href="/courses" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">
                คอร์สทั้งหมด
              </Link>
            </div>
          </div>

          {/* Right: user actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-gray-600">สวัสดี, {user.name}</span>
                <Link href="/dashboard" className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg text-gray-600 hover:text-indigo-600 hover:bg-gray-50 transition-colors">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                {user.role === "student" && (
                  <Link href="/dashboard/schedule" className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg text-gray-600 hover:text-indigo-600 hover:bg-gray-50 transition-colors">
                    <CalendarDays className="w-4 h-4" />
                    ตารางเรียน
                  </Link>
                )}
                {user.role === "student" && (
                  <Link href="/dashboard/certificates" className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg text-gray-600 hover:text-indigo-600 hover:bg-gray-50 transition-colors">
                    <Award className="w-4 h-4" />
                    ใบรับรอง
                  </Link>
                )}
                {user.role === "student" && (
                  <Link href="/dashboard/receipts" className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg text-gray-600 hover:text-indigo-600 hover:bg-gray-50 transition-colors">
                    <Receipt className="w-4 h-4" />
                    ใบเสร็จ
                  </Link>
                )}
                {user.role === "student" && (
                  <Link href="/dashboard/forum" className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg text-gray-600 hover:text-indigo-600 hover:bg-gray-50 transition-colors">
                    <MessageSquare className="w-4 h-4" />
                    Forum
                  </Link>
                )}
                {user.role === "student" && (
                  <Link href="/dashboard/reviews" className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg text-gray-600 hover:text-indigo-600 hover:bg-gray-50 transition-colors">
                    <Star className="w-4 h-4" />
                    รีวิว
                  </Link>
                )}
                {user && <NotificationBell />}
                {(user.role === "student" || user.role === "parent") && (
                  <Link href="/student" className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors">
                    <BookOpen className="w-4 h-4" />
                    ศูนย์การเรียน
                  </Link>
                )}
                {(user.role === "admin" || user.role === "teacher") && (
                  <Link href="/admin" className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors">
                    <User className="w-4 h-4" />
                    จัดการหลังบ้าน
                  </Link>
                )}
                {user.role === "super_admin" && (
                  <div ref={dropdownRef}>
                    <button
                      onClick={() => setSuperAdminDropdown(!superAdminDropdown)}
                      className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      จัดการหลังบ้าน
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${superAdminDropdown ? "rotate-180" : ""}`} />
                    </button>
                    {superAdminDropdown && (
                      <div className="absolute -right-2 top-12 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-[99999]">
                        {/* Dashboard */}
                        <div>
                          <p className="px-4 pt-3 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">ภาพรวม</p>
                          <Link href="/super-admin" onClick={() => setSuperAdminDropdown(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            <LayoutDashboard className="w-4 h-4" />
                            ภาพรวม
                          </Link>
                          <Link href="/super-admin/analytics" onClick={() => setSuperAdminDropdown(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            <BarChart2 className="w-4 h-4" />
                            Analytics
                          </Link>
                        </div>

                        {/* Management */}
                        <div className="border-t border-gray-100 mt-2">
                          <p className="px-4 pt-3 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">จัดการ</p>
                          <Link href="/super-admin/institutions" onClick={() => setSuperAdminDropdown(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            <Building2 className="w-4 h-4" />
                            สถาบัน
                          </Link>
                          <Link href="/super-admin/members" onClick={() => setSuperAdminDropdown(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            <ShieldCheck className="w-4 h-4" />
                            อนุมัติสมาชิก
                          </Link>
                          <Link href="/super-admin/users" onClick={() => setSuperAdminDropdown(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            <UsersIcon className="w-4 h-4" />
                            จัดการผู้ใช้
                          </Link>
                        </div>

                        {/* Finance */}
                        <div className="border-t border-gray-100 mt-2">
                          <p className="px-4 pt-3 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">การเงิน</p>
                          <Link href="/super-admin/finance" onClick={() => setSuperAdminDropdown(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            <Wallet className="w-4 h-4" />
                            ข้อมูลทางการเงิน
                          </Link>
                          <Link href="/super-admin/payouts" onClick={() => setSuperAdminDropdown(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            <Receipt className="w-4 h-4" />
                            Commission & Payout
                          </Link>
                        </div>

                        {/* System */}
                        <div className="border-t border-gray-100 mt-2">
                          <p className="px-4 pt-3 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">ระบบ</p>
                          <Link href="/super-admin/settings" onClick={() => setSuperAdminDropdown(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            <Settings className="w-4 h-4" />
                            ตั้งค่าทั่วไป
                          </Link>
                          <Link href="/super-admin/roles" onClick={() => setSuperAdminDropdown(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            <ShieldCheck className="w-4 h-4" />
                            จัดการ Role
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <Link href="/dashboard/profile" className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg text-gray-500 hover:text-violet-600 hover:bg-violet-50 transition-colors">
                  <User className="w-4 h-4" />
                  โปรไฟล์
                </Link>
                <button onClick={logout} className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors">
                  <LogOut className="w-4 h-4" />
                  ออกจากระบบ
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm px-4 py-2 rounded-lg text-gray-600 hover:text-indigo-600 hover:bg-gray-50 transition-colors">
                  เข้าสู่ระบบ
                </Link>
                <Link href="/register" className="text-sm font-semibold px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
                  สมัครสมาชิก
                </Link>
                <TrialRequestModal navbar />
              </>
            )}
          </div>

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex items-center p-2 text-gray-600 transition-colors"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-1 border-t border-gray-100 pt-3">
            <Link href="/courses" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">คอร์สทั้งหมด</Link>
            {user ? (
              <>
                <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">Dashboard</Link>
                {user.role === "student" && (
                  <Link href="/dashboard/schedule" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">ตารางเรียน</Link>
                )}
                {(user.role === "student" || user.role === "parent") && (
                  <Link href="/student" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-emerald-600 font-medium hover:bg-emerald-50 rounded-lg">ศูนย์การเรียน</Link>
                )}
                {user.role === "student" && (
                  <Link href="/dashboard/certificates" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">ใบรับรอง</Link>
                )}
                {user.role === "student" && (
                  <Link href="/dashboard/receipts" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">ใบเสร็จ</Link>
                )}
                {user.role === "student" && (
                  <Link href="/dashboard/forum" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">Forum</Link>
                )}
                {user.role === "student" && (
                  <Link href="/dashboard/reviews" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">รีวิวคอร์ส</Link>
                )}
                {(user.role === "admin" || user.role === "teacher") && (
                  <Link href="/admin" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-indigo-600 font-medium hover:bg-indigo-50 rounded-lg">จัดการหลังบ้าน</Link>
                )}
                {user.role === "super_admin" && (
                  <>
                    <Link href="/super-admin" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-rose-600 font-medium hover:bg-rose-50 rounded-lg">ภาพรวม</Link>
                    <Link href="/super-admin/members" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg">อนุมัติสมาชิก</Link>
                    <Link href="/super-admin/users" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg">จัดการผู้ใช้</Link>
                    <Link href="/super-admin/finance" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg">ข้อมูลทางการเงิน</Link>
                    <Link href="/super-admin/settings" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg">ตั้งค่าทั่วไป</Link>
                  </>
                )}
                <button onClick={() => { logout(); setMenuOpen(false); }} className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">ออกจากระบบ</button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">เข้าสู่ระบบ</Link>
                <Link href="/register" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-indigo-600 font-medium hover:bg-indigo-50 rounded-lg">สมัครสมาชิก</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
