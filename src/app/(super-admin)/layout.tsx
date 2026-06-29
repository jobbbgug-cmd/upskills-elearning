"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Building2, LogOut, Menu, X, ShieldCheck, Receipt,
  UserCog, Users, Wallet, Images, Shield, Home,
  UserCheck, BookOpen, FileText, TrendingUp, ChevronDown, FlaskConical, Settings,
  CalendarDays, GraduationCap, ClipboardList, BarChart2,
  Radio, Star, MessageSquare, Tag,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface UserInfo {
  name: string;
  email: string;
  profileImage?: string;
}

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen]               = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [user, setUser]               = useState<UserInfo | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [pendingMembers, setPendingMembers] = useState(0);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(["platform", "members"]));
  const pathname = usePathname();
  const router   = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navRef      = useRef<HTMLElement>(null);
  const close = () => setOpen(false);

  const toggleGroup = (group: string) => {
    const newSet = new Set(expandedGroups);
    if (newSet.has(group)) {
      newSet.delete(group);
    } else {
      newSet.add(group);
    }
    setExpandedGroups(newSet);
  };

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const saved = sessionStorage.getItem("superadmin-nav-scroll");
    if (saved) nav.scrollTop = Number(saved);
  }, []);

  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.user) setUser({ name: d.user.name, email: d.user.email, profileImage: d.user.profileImage }); });
  }, []);

  useEffect(() => {
    fetch("/api/admin/users/pending")
      .then((r) => r.json())
      .then((data) => setPendingMembers(Array.isArray(data) ? data.length : 0))
      .catch(() => {
        // Test/demo: show badge
        setPendingMembers(1);
      });
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/me", { method: "DELETE" });
    router.push("/");
  };

  const section = (id: string, title: string, badge?: number) => (
    <button
      onClick={() => toggleGroup(id)}
      className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600 transition-colors group"
    >
      <span className="flex items-center gap-2">
        {title}
        {badge !== undefined && badge > 0 && (
          <span className="w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{badge}</span>
        )}
      </span>
      <ChevronDown className={`w-4 h-4 transition-transform ${expandedGroups.has(id) ? "rotate-180" : ""}`} />
    </button>
  );

  const nav = (href: string, icon: React.ReactNode, label: string, badge?: number) => {
    const active = pathname === href || (href !== "/super-admin" && pathname.startsWith(href));
    return (
      <Link
        href={href}
        onClick={() => { close(); if (!active) setIsNavigating(true); }}
        className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors ${
          active
            ? "bg-violet-50 text-violet-700 font-medium"
            : "text-gray-600 hover:bg-gray-50 hover:text-violet-600"
        }`}
      >
        {icon}
        {label}
        {badge !== undefined && badge > 0 && (
          <span className="ml-auto w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{badge}</span>
        )}
      </Link>
    );
  };

  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden">
      {open && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={close} />}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col shrink-0 transition-transform duration-200
        ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:transform-none`}>

        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <Link href="/" onClick={close}>
              <Image src="/logo.png" alt="UPSkills" width={120} height={40} className="object-contain" />
            </Link>
          </div>
          <button onClick={close} className="lg:hidden p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav
          ref={navRef}
          onScroll={(e) => sessionStorage.setItem("superadmin-nav-scroll", String((e.currentTarget as HTMLElement).scrollTop))}
          className="flex-1 p-3 space-y-0.5 overflow-y-auto"
        >
          {/* Platform */}
          <div className="pt-2 pb-1">{section("platform", "แพลตฟอร์ม")}</div>
          
          {expandedGroups.has("platform") && (
            <>
              {nav("/super-admin", <LayoutDashboard className="w-4 h-4" />, "ภาพรวม")}
              {nav("/super-admin/analytics", <BarChart2 className="w-4 h-4" />, "Analytics")}
              {nav("/super-admin/institutions", <Building2 className="w-4 h-4" />, "สถาบันทั้งหมด")}
              {nav("/super-admin/trials", <FlaskConical className="w-4 h-4" />, "คำขอทดลองใช้งาน")}
              {nav("/super-admin/payouts", <Receipt className="w-4 h-4" />, "Commission & Payout")}
            </>
          )}

          {/* Member management */}
          <div className="pt-4 pb-1">{section("members", "จัดการสมาชิก", pendingMembers)}</div>
          {expandedGroups.has("members") && (
            <>
              {nav("/super-admin/members", <UserCheck className="w-4 h-4" />, "อนุมัติสมาชิก", pendingMembers)}
          {nav("/super-admin/users", <UserCog className="w-4 h-4" />, "จัดการผู้ใช้งาน")}
            </>
          )}

          {/* Phase 5-6 features */}
          <div className="pt-4 pb-1">{section("features", "ฟีเจอร์แพลตฟอร์ม")}</div>
          {expandedGroups.has("features") && (
            <>
              {nav("/super-admin/live",    <Radio className="w-4 h-4" />,        "Live Sessions")}
          {nav("/super-admin/reviews", <Star className="w-4 h-4" />,         "รีวิวคอร์ส")}
          {nav("/super-admin/forum",   <MessageSquare className="w-4 h-4" />, "Forum")}
          {nav("/super-admin/coupons", <Tag className="w-4 h-4" />,          "คูปองส่วนลด")}
            </>
          )}

          {/* Content management */}
          <div className="pt-4 pb-1">{section("content", "จัดการเนื้อหา")}</div>
          {expandedGroups.has("content") && (
            <>
              {nav("/super-admin/courses", <BookOpen className="w-4 h-4" />, "จัดการคอร์ส")}
          {nav("/super-admin/content", <FileText className="w-4 h-4" />, "เนื้อหาการเรียน")}
          {nav("/super-admin/revenue", <TrendingUp className="w-4 h-4" />, "รายได้")}
          {nav("/super-admin/schedule", <CalendarDays className="w-4 h-4" />, "ตารางสอน")}
          {nav("/super-admin/student-schedule", <GraduationCap className="w-4 h-4" />, "ตารางเรียน")}
            </>
          )}

          {/* System */}
          <div className="pt-4 pb-1">{section("system", "จัดการระบบ")}</div>
          {expandedGroups.has("system") && (
            <>
              {nav("/super-admin/bookings", <Users className="w-4 h-4" />, "ตรวจสอบการชำระ")}
          {nav("/super-admin/finance", <Wallet className="w-4 h-4" />, "ข้อมูลทางการเงิน")}
          {nav("/super-admin/banners", <Images className="w-4 h-4" />, "จัดการแบนเนอร์")}
          {nav("/super-admin/roles", <Shield className="w-4 h-4" />, "จัดการ Role")}
          {nav("/super-admin/logs", <ClipboardList className="w-4 h-4" />, "ประวัติการใช้งาน")}
          {nav("/super-admin/settings", <Settings className="w-4 h-4" />, "ตั้งค่าทั่วไป")}
            </>
          )}
        </nav>

        <div className="p-3 border-t border-gray-100 space-y-0.5">
          <Link
            href="/"
            onClick={close}
            className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg text-gray-500 hover:bg-gray-50 hover:text-violet-600 transition-colors"
          >
            <Home className="w-4 h-4" />
            กลับหน้าหลัก
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            ออกจากระบบ
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto min-w-0">
        {isNavigating && (
          <div className="fixed top-0 left-0 right-0 z-[9999] h-[2px] overflow-hidden">
            <div className="h-full w-[30%] bg-gradient-to-r from-violet-400 to-violet-600"
              style={{ animation: "nav-progress 0.8s ease infinite" }} />
          </div>
        )}
        {/* Topbar */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-3">
          <button
            onClick={() => setOpen(true)}
            className="lg:hidden p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/" className="lg:hidden">
            <Image src="/logo.png" alt="UPSkills" width={100} height={34} className="object-contain" />
          </Link>
          <span className="hidden lg:block text-sm font-semibold text-violet-700">Super Admin Panel</span>

          {/* User menu */}
          <div className="ml-auto relative" ref={dropdownRef}>
            <button
              onClick={() => setUserDropdown((v) => !v)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center shrink-0 overflow-hidden">
                {user?.profileImage ? (
                  <Image src={user.profileImage} alt={user.name} width={32} height={32} className="w-full h-full object-cover" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-violet-600" />
                )}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-sm font-medium text-gray-800 leading-tight">{user?.name || "Super Admin"}</div>
                <div className="text-xs text-violet-500 leading-tight">Super Admin</div>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${userDropdown ? "rotate-180" : ""}`} />
            </button>
            {userDropdown && (
              <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                <div className="px-3 py-2 border-b border-gray-100">
                  <div className="text-sm font-medium text-gray-800">{user?.name || "Super Admin"}</div>
                  <div className="text-xs text-violet-500">Super Admin</div>
                </div>
                <Link href="/super-admin/profile" onClick={() => setUserDropdown(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <ShieldCheck className="w-4 h-4" />
                  โปรไฟล์ของฉัน
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  ออกจากระบบ
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-6xl mx-auto p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
