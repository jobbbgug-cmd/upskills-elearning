"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LogOut, Menu, X, ChevronDown, Home, School, ClipboardCheck, FileText, PenTool, Radio, Monitor, MessageSquare, ListChecks, BookOpen, CalendarDays, Award, TrendingUp, BarChart2, Receipt, ShieldCheck, User } from "lucide-react";

interface UserInfo {
  name: string;
  email: string;
  profileImage?: string;
}

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string>("/logo.png");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());

  const close = () => setSidebarOpen(false);
  const toggleGroup = (id: string) => setOpenGroups((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const saved = sessionStorage.getItem("teacher-nav-scroll");
    if (saved) nav.scrollTop = Number(saved);
  }, []);

  useEffect(() => {
    setIsNavigating(false);
    const GP: Record<string, string[]> = {
      teaching: ["/teacher/students", "/teacher/attendance", "/teacher/homework", "/teacher/quiz", "/teacher/live", "/teacher/portal", "/teacher/forum"],
      courses: ["/teacher/courses", "/teacher/content", "/teacher/schedule", "/teacher/class-schedule", "/teacher/certificates"],
      finance: ["/teacher/revenue", "/teacher/analytics", "/teacher/billing"],
    };
    for (const [id, paths] of Object.entries(GP)) {
      if (paths.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
        setOpenGroups((prev) => new Set([...prev, id]));
        break;
      }
    }
  }, [pathname]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.user) setUser({ name: d.user.name, email: d.user.email, profileImage: d.user.profileImage }); });
  }, []);

  useEffect(() => {
    if (!dropdownRef.current) return;
    const handleClick = (e: MouseEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) {
        setUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const navLink = (href: string, icon: React.ReactNode, label: React.ReactNode) => {
    const isActive = pathname === href;
    return (
      <Link href={href} onClick={close}
        className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors ${
          isActive
            ? "bg-violet-100 text-violet-600 font-semibold"
            : "text-gray-700 hover:bg-gray-50"
        }`}>
        <span>{icon}</span>
        <span className="flex-1">{label}</span>
      </Link>
    );
  };

  const renderGroup = (id: string, label: string, icon: React.ReactNode, paths: string[], children: React.ReactNode) => {
    const isOpen = openGroups.has(id);
    const hasActive = paths.some((p) => pathname === p || pathname.startsWith(p + "/"));
    return (
      <div key={id}>
        <button onClick={() => toggleGroup(id)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors menu-hover ${
            hasActive ? "menu-section-active font-semibold" : "text-gray-700 hover:bg-gray-50"
          }`}>
          <span>{icon}</span>
          <span className="flex-1 text-left">{label}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </button>
        {isOpen && (
          <div className="ml-3 pl-3 border-l border-gray-100 space-y-0.5 mt-0.5 mb-1">
            {children}
          </div>
        )}
      </div>
    );
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden">
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={close} />}

      <aside className={`fixed inset-y-0 left-0 z-50 w-60 bg-white border-r border-gray-200 flex flex-col shrink-0 transition-transform duration-200
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:transform-none`}>

        <div className="px-5 py-[5.6px] border-b border-gray-100 flex items-center justify-between">
          <Link href="/" onClick={close}>
            <Image src={logoUrl} alt="UPSkills" width={150} height={50} className="object-contain w-[150px] h-[50px]" />
          </Link>
          <button onClick={close} className="lg:hidden p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav
          ref={navRef}
          onScroll={(e) => sessionStorage.setItem("teacher-nav-scroll", String((e.currentTarget as HTMLElement).scrollTop))}
          className="flex-1 p-3 space-y-1 overflow-y-auto"
        >
          {navLink("/teacher/dashboard", <LayoutDashboard className="w-4 h-4" />, "ภาพรวม")}

          {renderGroup("teaching", "การเรียนการสอน", <School className="w-4 h-4" />,
            ["/teacher/students", "/teacher/attendance", "/teacher/homework", "/teacher/quiz", "/teacher/live", "/teacher/portal", "/teacher/forum"],
            <>
              {navLink("/teacher/students", <School className="w-4 h-4" />, "จัดการนักเรียน")}
              {navLink("/teacher/attendance", <ClipboardCheck className="w-4 h-4" />, "เช็คชื่อ")}
              {navLink("/teacher/homework", <FileText className="w-4 h-4" />, "การบ้าน")}
              {navLink("/teacher/quiz", <PenTool className="w-4 h-4" />, "ข้อสอบ")}
              {navLink("/teacher/live", <Radio className="w-4 h-4" />, "Live Class")}
              {navLink("/teacher/portal", <Monitor className="w-4 h-4" />, "Teacher Portal")}
              {navLink("/teacher/forum", <MessageSquare className="w-4 h-4" />, "Forum")}
            </>
          )}

          {renderGroup("courses", "คอร์สและเนื้อหา", <BookOpen className="w-4 h-4" />,
            ["/teacher/courses", "/teacher/content", "/teacher/schedule", "/teacher/class-schedule", "/teacher/certificates"],
            <>
              {navLink("/teacher/courses", <ListChecks className="w-4 h-4" />, "จัดการคอร์ส")}
              {navLink("/teacher/content", <BookOpen className="w-4 h-4" />, "เนื้อหาการเรียน")}
              {navLink("/teacher/schedule", <CalendarDays className="w-4 h-4" />, "ตารางเรียน")}
              {navLink("/teacher/class-schedule", <CalendarDays className="w-4 h-4" />, "ตารางสอน")}
              {navLink("/teacher/certificates", <Award className="w-4 h-4" />, "ใบรับรอง")}
            </>
          )}

          {renderGroup("finance", "รายได้และการเงิน", <TrendingUp className="w-4 h-4" />,
            ["/teacher/revenue", "/teacher/analytics", "/teacher/billing"],
            <>
              {navLink("/teacher/revenue", <TrendingUp className="w-4 h-4" />, "รายได้")}
              {navLink("/teacher/analytics", <BarChart2 className="w-4 h-4" />, "Analytics")}
              {navLink("/teacher/billing", <Receipt className="w-4 h-4" />, "Billing & ใบเสร็จ")}
            </>
          )}
        </nav>

        <div className="p-3 border-t border-gray-100">
          <Link href="/" onClick={close}
            className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg text-gray-500 hover:bg-gray-50 hover:text-violet-600 transition-colors">
            <Home className="w-4 h-4" />
            กลับหน้าหลัก
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-auto min-w-0">
        {isNavigating && (
          <div className="fixed top-0 left-0 right-0 z-[9999] h-[2px] overflow-hidden">
            <div className="h-full w-[30%] bg-gradient-to-r from-violet-400 to-violet-600"
              style={{ animation: "nav-progress 0.8s ease infinite" }} />
          </div>
        )}

        <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/" className="lg:hidden">
            <Image src={logoUrl} alt="UPSkills" width={100} height={34} className="object-contain w-[100px] h-[34px]" />
          </Link>
          <span className="hidden lg:block text-sm font-semibold theme-link">Teacher Dashboard</span>

          <div className="ml-auto flex items-center gap-3">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setUserDropdown((v) => !v)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center shrink-0 overflow-hidden">
                  {user?.profileImage ? (
                    <Image src={user.profileImage} alt={user.name} width={32} height={32} className="w-full h-full object-cover" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 text-violet-600" />
                  )}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-sm font-medium text-gray-800 leading-tight">{user?.name || "Teacher"}</div>
                  <div className="text-xs theme-link leading-tight">Instructor</div>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${userDropdown ? "rotate-180" : ""}`} />
              </button>
              {userDropdown && (
                <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-800">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                    <LogOut className="w-4 h-4" />
                    ออกจากระบบ
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-screen-2xl mx-auto">
          {children}
        </div>
      </main>

      <style jsx global>{`
        .menu-hover {
          --tw-bg-opacity: 1;
        }
        .menu-section-active {
          @apply bg-violet-50 text-violet-600;
        }
      `}</style>
    </div>
  );
}
