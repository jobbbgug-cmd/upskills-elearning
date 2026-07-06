"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ListChecks, Users, LogOut, Images, UserCog, UserCheck, BookOpen, TrendingUp, CalendarDays, GraduationCap, Menu, X, Wallet, AlertTriangle, Palette, Shield, ShieldCheck, User, ChevronDown, ChevronRight, Home, Building2, School, ClipboardCheck, FileText, PenLine, Bell, BarChart2, Radio, Receipt, Globe, Monitor, Star, Tag, MessageSquare, LayoutGrid, Award, ShoppingCart, Package } from "lucide-react";
import NotificationBell from "@/components/NotificationBell";
import { PLAN_LABELS } from "@/lib/planLimits";
import { THEMES, getTheme, setTheme, type Theme } from "@/lib/theme";

interface Subscription {
  plan: string | null;
  planLabel: string;
  planExpiresAt: string | null;
  isActive: boolean;
  isExpired: boolean;
  daysLeft: number | null;
}

interface BranchOption { _id: string; name: string; isActive: boolean; }

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [pendingCount, setPendingCount]       = useState(0);
  const [pendingBookings, setPendingBookings] = useState(0);
  const [role, setRole]                       = useState<string>("");
  const [userName, setUserName]               = useState<string>("");
  const [userImage, setUserImage]             = useState<string>("");
  const [institutionName, setInstitutionName] = useState<string>("");
  const [institutionLogo, setInstitutionLogo] = useState<string>("");
  const [subscription, setSubscription]       = useState<Subscription | null>(null);
  const [sidebarOpen, setSidebarOpen]         = useState(false);
  const [userDropdown, setUserDropdown]       = useState(false);
  const [isNavigating, setIsNavigating]       = useState(false);
  const [branches, setBranches]               = useState<BranchOption[]>([]);
  const [activeBranchId, setActiveBranchId]   = useState<string>("");
  const [currentTheme, setCurrentTheme]       = useState<Theme>('default');
  const [themeOpen, setThemeOpen]             = useState(false);
  const [switchingBranch, setSwitchingBranch] = useState(false);
  const dropdownRef  = useRef<HTMLDivElement>(null);
  const moreMenuRef  = useRef<HTMLDivElement>(null);
  const navRef       = useRef<HTMLElement>(null);
  const pathname     = usePathname();
  const [openGroups,      setOpenGroups]      = useState<Set<string>>(new Set());
  const [moreMenuOpen,    setMoreMenuOpen]    = useState(false);
  const [activeMoreGroup, setActiveMoreGroup] = useState<string | null>(null);
  const toggleGroup = (id: string) => setOpenGroups((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const saved = sessionStorage.getItem("admin-nav-scroll");
    if (saved) nav.scrollTop = Number(saved);
  }, []);

  useEffect(() => {
    const theme = getTheme();
    setCurrentTheme(theme);
  }, []);

  useEffect(() => {
    setIsNavigating(false);
    setMoreMenuOpen(false);
    setThemeOpen(false);
    const GP: Record<string, string[]> = {
      teaching:  ["/admin/students","/admin/attendance","/admin/homework","/admin/quiz","/admin/live","/admin/teacher-portal","/admin/forum"],
      courses:   ["/admin/courses","/admin/content","/admin/schedule","/dashboard/schedule"],
      members:   ["/admin/members","/admin/users"],
      commerce:  ["/admin/orders","/admin/products","/admin/coupons"],
      finance:   ["/admin/analytics","/admin/revenue","/admin/billing","/admin/certificates","/admin/bookings","/admin/finance"],
      marketing: ["/admin/landing","/admin/reviews","/admin/notifications","/admin/banners"],
      settings:  ["/admin/roles","/admin/branding"],
    };
    for (const [id, paths] of Object.entries(GP)) {
      if (paths.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
        setOpenGroups((prev) => new Set([...prev, id]));
        break;
      }
    }
  }, [pathname]);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      try {
        const res = await fetch("/api/admin/layout-init", { signal: controller.signal });
        if (!res.ok) return;
        const data = await res.json();

        setPendingCount(data.pendingCount ?? 0);
        setPendingBookings(data.pendingBookings ?? 0);
        setSubscription(data.subscription ?? null);
        if (data.logoUrl) setInstitutionLogo(data.logoUrl);

        const u = data.user;
        if (u) {
          const userRole = u.role ?? "";
          setRole(userRole);
          setUserName(u.name ?? "");
          setUserImage(u.profileImage ?? "");
          setInstitutionName(u.institutionId?.name ?? "");

          if (userRole === "owner") {
            const branchRes = await fetch("/api/owner/branches", { signal: controller.signal });
            if (branchRes.ok) {
              const branchData: BranchOption[] = await branchRes.json();
              setBranches(branchData);
              if (branchData.length > 0) setActiveBranchId(branchData[0]._id);
            }
          }
        }
      } catch (e) {
        if ((e as Error).name !== "AbortError") console.error(e);
      }
    };

    load();
    const interval = setInterval(load, 30000);
    return () => { controller.abort(); clearInterval(interval); };
  }, []);

  const isOwner = role === "owner";
  const isAdmin = role === "admin" || role === "super_admin" || isOwner;
  const close = () => setSidebarOpen(false);

  const switchBranch = async (branchId: string) => {
    setSwitchingBranch(true);
    setActiveBranchId(branchId);
    await fetch("/api/owner/switch-branch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ branchId }),
    });
    setSwitchingBranch(false);
    window.location.reload();
  };

  const handleLogout = async () => {
    await fetch("/api/auth/me", { method: "DELETE" });
    window.location.href = "/";
  };

  const ROLE_LABELS: Record<string, string> = {
    super_admin: "Super Admin",
    admin: "Admin",
    owner: "เจ้าของสถาบัน",
    teacher: "Teacher",
    student: "Student",
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setUserDropdown(false);
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) setMoreMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    const onBrandingUpdated = (e: Event) => {
      const { logoUrl } = (e as CustomEvent).detail ?? {};
      if (logoUrl !== undefined) setInstitutionLogo(logoUrl);
    };
    window.addEventListener("branding-updated", onBrandingUpdated);
    return () => window.removeEventListener("branding-updated", onBrandingUpdated);
  }, []);

  const ROLE_AVATAR: Record<string, { icon: React.ElementType; bg: string; color: string }> = {
    student:     { icon: User,         bg: "bg-blue-100",   color: "text-blue-700" },
    teacher:     { icon: GraduationCap, bg: "bg-green-100", color: "text-green-700" },
    admin:       { icon: Shield,        bg: "bg-purple-100", color: "text-purple-700" },
    owner:       { icon: ShieldCheck,   bg: "bg-violet-100", color: "text-violet-700" },
    super_admin: { icon: ShieldCheck,   bg: "bg-rose-100",   color: "text-rose-700" },
  };

  const UserMenu = () => {
    const avatar = ROLE_AVATAR[role] ?? ROLE_AVATAR.student;
    const RoleIcon = avatar.icon;
    return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setUserDropdown((v) => !v)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
      >
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 overflow-hidden ${!userImage ? `${avatar.bg} ${avatar.color}` : ""}`}>
          {userImage ? (
            <Image src={userImage} alt={userName} width={32} height={32} className="w-full h-full object-cover" />
          ) : (
            <RoleIcon className="w-4 h-4" />
          )}
        </div>
        <div className="text-left hidden sm:block">
          <div className="text-sm font-medium text-gray-800 leading-tight">{userName || "User"}</div>
          <div className="text-xs text-gray-400 leading-tight">{ROLE_LABELS[role] ?? role}</div>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${userDropdown ? "rotate-180" : ""}`} />
      </button>
      {userDropdown && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
          <div className="px-3 py-2 border-b border-gray-100">
            <div className="text-sm font-medium text-gray-800">{userName}</div>
            <div className="text-xs text-gray-400">{ROLE_LABELS[role] ?? role}</div>
            {institutionName && (
              <div className="text-xs theme-link mt-0.5 truncate">{institutionName}</div>
            )}
          </div>
          <Link href="/admin/profile" onClick={() => setUserDropdown(false)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            <User className="w-4 h-4" />
            โปรไฟล์ของฉัน
          </Link>

          {/* Theme Switcher */}
          <div className="relative border-t border-gray-100">
            <button onClick={() => setThemeOpen(!themeOpen)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left">
              <Palette className="w-4 h-4" />
              ธีมสี
              <ChevronDown className={`w-3.5 h-3.5 ml-auto transition-transform ${themeOpen ? 'rotate-180' : ''}`} />
            </button>
            {themeOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                {(Object.entries(THEMES) as [Theme, typeof THEMES[Theme]][]).map(([key, theme]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setTheme(key);
                      setCurrentTheme(key);
                      setThemeOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${
                      currentTheme === key
                        ? 'bg-indigo-50 text-gray-900 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.primary }} />
                    {theme.name}
                  </button>
                ))}
              </div>
            )}
          </div>

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
  );
  };

  const navLink = (href: string, icon: React.ReactNode, label: React.ReactNode) => {
    const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
    return (
      <Link href={href} onClick={() => { close(); if (!active) setIsNavigating(true); }}
        className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors ${
          active
            ? "menu-active font-medium"
            : "text-gray-600 hover:bg-gray-50 menu-hover"
        }`}>
        {icon}
        {label}
      </Link>
    );
  };

  const renderGroup = (id: string, label: string, icon: React.ReactNode, paths: string[], children: React.ReactNode, badge?: number) => {
    const isOpen   = openGroups.has(id);
    const hasActive = paths.some((p) => pathname === p || pathname.startsWith(p + "/"));
    return (
      <div key={id}>
        <button onClick={() => toggleGroup(id)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors ${
            hasActive ? "menu-active font-semibold" : "text-gray-700 hover:bg-gray-50 menu-hover"
          }`}>
          <span>{icon}</span>
          <span className="flex-1 text-left">{label}</span>
          {badge !== undefined && badge > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
              {badge}
            </span>
          )}
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""} ${hasActive ? "text-white" : "text-gray-400"}`} />
        </button>
        {isOpen && (
          <div className="ml-3 pl-3 border-l border-gray-100 space-y-0.5 mt-0.5 mb-1">
            {children}
          </div>
        )}
      </div>
    );
  };

  const moreLink = (href: string, icon: React.ReactNode, label: React.ReactNode) => {
    const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
    return (
      <Link href={href} onClick={() => { setMoreMenuOpen(false); if (!active) setIsNavigating(true); }}
        className={`flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg transition-colors ${
          active ? "menu-active font-medium" : "text-gray-600 hover:bg-gray-50"
        }`}>
        {icon}
        {label}
      </Link>
    );
  };

  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={close} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-60 bg-white border-r border-gray-200 flex flex-col shrink-0 transition-transform duration-200
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:transform-none`}>

        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <Link href="/" onClick={close}>
            {institutionLogo ? (
              <Image src={institutionLogo} alt={institutionName || "Logo"} width={150} height={50} className="object-contain h-10 w-auto max-w-[150px]" />
            ) : (
              <Image src="/logo.png" alt="UPSkills" width={150} height={50} className="object-contain" />
            )}
          </Link>
          <button onClick={close} className="lg:hidden p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav
          ref={navRef}
          onScroll={(e) => sessionStorage.setItem("admin-nav-scroll", String((e.currentTarget as HTMLElement).scrollTop))}
          className="flex-1 p-3 space-y-1 overflow-y-auto"
        >
          {isAdmin && navLink("/admin", <LayoutDashboard className="w-4 h-4" />, "ภาพรวม")}

          {renderGroup("teaching", "การเรียนการสอน", <GraduationCap className="w-4 h-4" />,
            ["/admin/students","/admin/attendance","/admin/homework","/admin/quiz","/admin/live","/admin/teacher-portal","/admin/forum"],
            <>
              {(isAdmin || role === "teacher") && navLink("/admin/students",      <School className="w-4 h-4" />,        "จัดการนักเรียน")}
              {(isAdmin || role === "teacher") && navLink("/admin/attendance",    <ClipboardCheck className="w-4 h-4" />, "เช็คชื่อ")}
              {(isAdmin || role === "teacher") && navLink("/admin/homework",      <FileText className="w-4 h-4" />,       "การบ้าน")}
              {(isAdmin || role === "teacher") && navLink("/admin/quiz",          <PenLine className="w-4 h-4" />,        "ข้อสอบ")}
              {(isAdmin || role === "teacher") && navLink("/admin/live",          <Radio className="w-4 h-4" />,          "Live Class")}
              {(isAdmin || role === "teacher") && navLink("/admin/teacher-portal",<Monitor className="w-4 h-4" />,        "Teacher Portal")}
              {(isAdmin || role === "teacher") && navLink("/admin/forum",         <MessageSquare className="w-4 h-4" />,  "Forum")}
            </>
          )}

          {renderGroup("courses", "คอร์สและเนื้อหา", <BookOpen className="w-4 h-4" />,
            ["/admin/courses","/admin/content","/admin/schedule","/dashboard/schedule"],
            <>
              {(isAdmin || role === "teacher") && navLink("/admin/courses",    <ListChecks className="w-4 h-4" />,   "จัดการคอร์ส")}
              {(isAdmin || role === "teacher") && navLink("/admin/content",    <BookOpen className="w-4 h-4" />,     "เนื้อหาการเรียน")}
              {(isAdmin || role === "teacher") && navLink("/admin/schedule",   <CalendarDays className="w-4 h-4" />, "ตารางสอน")}
              {isAdmin                         && navLink("/dashboard/schedule",<GraduationCap className="w-4 h-4" />,"ตารางเรียน")}
            </>
          )}

          {renderGroup("members", "สมาชิก", <Users className="w-4 h-4" />, 
            ["/admin/members","/admin/users"],
            <>
              {isAdmin && navLink("/admin/members", <UserCheck className="w-4 h-4" />,
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
            </>,
            pendingCount
          )}

          {renderGroup("commerce", "ระบบขาย", <ShoppingCart className="w-4 h-4" />,
            ["/admin/orders","/admin/products","/admin/coupons"],
            <>
              {isAdmin && navLink("/admin/orders", <ShoppingCart className="w-4 h-4" />, "รายการขาย")}
              {isAdmin && navLink("/admin/products", <Package className="w-4 h-4" />, "จัดการสินค้า")}
              {isAdmin && navLink("/admin/coupons", <Tag className="w-4 h-4" />, "คูปอง/โปรโมชั่น")}
            </>
          )}

          {renderGroup("finance", "รายได้และการเงิน", <TrendingUp className="w-4 h-4" />,
            ["/admin/analytics","/admin/revenue","/admin/billing","/admin/certificates","/admin/bookings","/admin/finance"],
            <>
              {isAdmin                         && navLink("/admin/analytics", <BarChart2 className="w-4 h-4" />, "Analytics")}
              {(isAdmin || role === "teacher") && navLink("/admin/revenue",   <TrendingUp className="w-4 h-4" />, "รายได้")}
              {isAdmin                         && navLink("/admin/billing",   <Receipt className="w-4 h-4" />,    "Billing & ใบเสร็จ")}
              {isAdmin                         && navLink("/admin/certificates", <Award className="w-4 h-4" />,    "ใบรับรอง")}
              {role === "super_admin"          && navLink("/admin/bookings",  <Users className="w-4 h-4" />,
                <span className="flex items-center justify-between w-full gap-2">
                  ตรวจสอบการชำระ
                  {pendingBookings > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                      {pendingBookings}
                    </span>
                  )}
                </span>
              )}
              {role === "super_admin" && navLink("/admin/finance", <Wallet className="w-4 h-4" />, "ข้อมูลทางการเงิน")}
            </>
          )}

          {renderGroup("marketing", "การตลาด", <Globe className="w-4 h-4" />,
            ["/admin/landing","/admin/reviews","/admin/notifications","/admin/banners"],
            <>
              {isAdmin && navLink("/admin/landing",       <Globe className="w-4 h-4" />,   "Landing Page")}
              {isAdmin && navLink("/admin/reviews",       <Star className="w-4 h-4" />,    "รีวิวคอร์ส")}
              {isAdmin && navLink("/admin/notifications", <Bell className="w-4 h-4" />,    "แจ้งเตือน & ใบรับรอง")}
              {isAdmin && navLink("/admin/banners",       <Images className="w-4 h-4" />,  "จัดการแบนเนอร์")}
            </>
          )}

          {renderGroup("settings", "ตั้งค่าระบบ", <Shield className="w-4 h-4" />,
            ["/admin/roles","/admin/branding"],
            <>
              {role === "super_admin" && navLink("/admin/roles",    <Shield className="w-4 h-4" />,  "จัดการ Role")}
              {role === "admin"       && navLink("/admin/branding", <Palette className="w-4 h-4" />, "จัดการ Branding")}
            </>
          )}
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
                <p className="theme-link">หมดอายุใน {subscription.daysLeft} วัน</p>
              )}
              {subscription.daysLeft !== null && !subscription.isExpired && subscription.daysLeft > 7 && (
                <p className="theme-link">เหลือ {subscription.daysLeft} วัน</p>
              )}
              {subscription.daysLeft === null && <p className="text-gray-500">ไม่มีวันหมดอายุ</p>}
            </div>
          </div>
        )}

        <div className="p-3 border-t border-gray-100">
          <Link href="/" onClick={close}
            className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg text-gray-500 hover:bg-gray-50 hover:text-indigo-600 transition-colors">
            <Home className="w-4 h-4" />
            กลับหน้าหลัก
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto min-w-0">
        {isNavigating && (
          <div className="fixed top-0 left-0 right-0 z-[9999] h-[2px] overflow-hidden">
            <div className="h-full w-[30%] bg-gradient-to-r from-indigo-400 to-indigo-600"
              style={{ animation: "nav-progress 0.8s ease infinite" }} />
          </div>
        )}
        {/* Topbar */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/" className="lg:hidden">
            <Image src="/logo.png" alt="UPSkills" width={100} height={34} className="object-contain" />
          </Link>
          <div className="ml-auto flex items-center gap-2">
            {/* Branch switcher — owner only */}
            {isOwner && branches.length > 0 && (
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-violet-500 shrink-0" />
                <select
                  value={activeBranchId}
                  onChange={(e) => switchBranch(e.target.value)}
                  disabled={switchingBranch}
                  className="text-sm border border-violet-200 bg-violet-50 text-violet-800 font-medium rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-violet-400 cursor-pointer disabled:opacity-50 max-w-[200px]"
                >
                  {branches.map((b, idx) => (
                    <option key={b._id} value={b._id}>
                      {idx === 0 ? `${b.name} (หลัก)` : b.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {/* More menus dropdown */}
            <div className="relative" ref={moreMenuRef}>
              <button onClick={() => setMoreMenuOpen((v) => !v)}
                className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-xl transition-colors ${
                  moreMenuOpen ? "menu-active" : "text-gray-600 hover:bg-gray-50 menu-hover"
                }`}>
                <LayoutGrid className="w-4 h-4" />
                เมนูอื่นๆ
                {(pendingCount + pendingBookings) > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                    {pendingCount + pendingBookings}
                  </span>
                )}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${moreMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {moreMenuOpen && (
                <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 z-[100] w-52 p-2 space-y-0.5"
                  onMouseLeave={() => setActiveMoreGroup(null)}>
                  {([
                    { id: "teaching",  label: "การเรียนการสอน",  icon: <GraduationCap className="w-4 h-4" /> },
                    { id: "courses",   label: "คอร์สและเนื้อหา", icon: <BookOpen className="w-4 h-4" /> },
                    { id: "members",   label: "สมาชิก",           icon: <Users className="w-4 h-4" /> },
                    { id: "finance",   label: "รายได้และการเงิน", icon: <TrendingUp className="w-4 h-4" /> },
                    { id: "marketing", label: "การตลาด",          icon: <Globe className="w-4 h-4" /> },
                    { id: "settings",  label: "ตั้งค่าระบบ",      icon: <Shield className="w-4 h-4" /> },
                  ] as { id: string; label: string; icon: React.ReactNode }[]).map(({ id, label, icon }) => (
                    <div key={id} className="relative" onMouseEnter={() => setActiveMoreGroup(id)}>
                      <button className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors ${
                        activeMoreGroup === id ? "menu-active" : "text-gray-700 hover:bg-gray-50"
                      }`}>
                        <span>{icon}</span>
                        <span className="flex-1 text-left">{label}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                      </button>

                      {activeMoreGroup === id && (
                        <div className="absolute left-full top-0 ml-1 bg-white rounded-xl shadow-lg border border-gray-100 p-2 space-y-0.5 z-10 w-52">
                          {id === "teaching" && <>
                            {(isAdmin || role === "teacher") && moreLink("/admin/students",       <School className="w-3.5 h-3.5" />,        "จัดการนักเรียน")}
                            {(isAdmin || role === "teacher") && moreLink("/admin/attendance",     <ClipboardCheck className="w-3.5 h-3.5" />, "เช็คชื่อ")}
                            {(isAdmin || role === "teacher") && moreLink("/admin/homework",       <FileText className="w-3.5 h-3.5" />,       "การบ้าน")}
                            {(isAdmin || role === "teacher") && moreLink("/admin/quiz",           <PenLine className="w-3.5 h-3.5" />,        "ข้อสอบ")}
                            {(isAdmin || role === "teacher") && moreLink("/admin/live",           <Radio className="w-3.5 h-3.5" />,          "Live Class")}
                            {(isAdmin || role === "teacher") && moreLink("/admin/teacher-portal", <Monitor className="w-3.5 h-3.5" />,        "Teacher Portal")}
                            {(isAdmin || role === "teacher") && moreLink("/admin/forum",          <MessageSquare className="w-3.5 h-3.5" />,  "Forum")}
                          </>}
                          {id === "courses" && <>
                            {(isAdmin || role === "teacher") && moreLink("/admin/courses",      <ListChecks className="w-3.5 h-3.5" />,    "จัดการคอร์ส")}
                            {(isAdmin || role === "teacher") && moreLink("/admin/content",      <BookOpen className="w-3.5 h-3.5" />,      "เนื้อหาการเรียน")}
                            {(isAdmin || role === "teacher") && moreLink("/admin/schedule",     <CalendarDays className="w-3.5 h-3.5" />,  "ตารางสอน")}
                            {isAdmin                         && moreLink("/dashboard/schedule", <GraduationCap className="w-3.5 h-3.5" />, "ตารางเรียน")}
                          </>}
                          {id === "members" && <>
                            {isAdmin && moreLink("/admin/members", <UserCheck className="w-3.5 h-3.5" />,
                              <span className="flex items-center gap-2">อนุมัติสมาชิก
                                {pendingCount > 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 rounded-full">{pendingCount}</span>}
                              </span>
                            )}
                            {isAdmin && moreLink("/admin/users", <UserCog className="w-3.5 h-3.5" />, "จัดการผู้ใช้")}
                          </>}
                          {id === "commerce" && <>
                            {isAdmin && moreLink("/admin/orders", <ShoppingCart className="w-3.5 h-3.5" />, "รายการขาย")}
                            {isAdmin && moreLink("/admin/products", <Package className="w-3.5 h-3.5" />, "จัดการสินค้า")}
                            {isAdmin && moreLink("/admin/coupons", <Tag className="w-3.5 h-3.5" />, "คูปอง/โปรโมชั่น")}
                          </>}
                          {id === "finance" && <>
                            {isAdmin                         && moreLink("/admin/analytics", <BarChart2 className="w-3.5 h-3.5" />,  "Analytics")}
                            {(isAdmin || role === "teacher") && moreLink("/admin/revenue",   <TrendingUp className="w-3.5 h-3.5" />, "รายได้")}
                            {isAdmin                         && moreLink("/admin/billing",   <Receipt className="w-3.5 h-3.5" />,    "Billing & ใบเสร็จ")}
                            {isAdmin                         && moreLink("/admin/certificates", <Award className="w-3.5 h-3.5" />,    "ใบรับรอง")}
                            {role === "super_admin"          && moreLink("/admin/bookings",  <Users className="w-3.5 h-3.5" />,
                              <span className="flex items-center gap-2">ตรวจสอบการชำระ
                                {pendingBookings > 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 rounded-full">{pendingBookings}</span>}
                              </span>
                            )}
                            {role === "super_admin" && moreLink("/admin/finance", <Wallet className="w-3.5 h-3.5" />, "ข้อมูลทางการเงิน")}
                          </>}
                          {id === "marketing" && <>
                            {isAdmin && moreLink("/admin/landing",       <Globe className="w-3.5 h-3.5" />,  "Landing Page")}
                            {isAdmin && moreLink("/admin/reviews",       <Star className="w-3.5 h-3.5" />,   "รีวิวคอร์ส")}
                            {isAdmin && moreLink("/admin/notifications", <Bell className="w-3.5 h-3.5" />,   "แจ้งเตือน & ใบรับรอง")}
                            {isAdmin && moreLink("/admin/banners",       <Images className="w-3.5 h-3.5" />, "จัดการแบนเนอร์")}
                          </>}
                          {id === "settings" && <>
                            {role === "super_admin" && moreLink("/admin/roles",    <Shield className="w-3.5 h-3.5" />,  "จัดการ Role")}
                            {role === "admin"       && moreLink("/admin/branding", <Palette className="w-3.5 h-3.5" />, "จัดการ Branding")}
                          </>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {institutionName && (
              <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 theme-bg-light rounded-lg max-w-[160px]">
                <Building2 className="w-3.5 h-3.5 theme-link shrink-0" />
                <span className="text-sm theme-link font-medium truncate">{institutionName}</span>
              </div>
            )}

            <NotificationBell />
            <UserMenu />
          </div>
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
