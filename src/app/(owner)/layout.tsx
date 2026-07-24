"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ListChecks, Users, LogOut, Images, UserCog, UserCheck, BookOpen, TrendingUp, CalendarDays, GraduationCap, Menu, X, Palette, Shield, ShieldCheck, User, ChevronDown, Home, School, ClipboardCheck, FileText, Bell, BarChart2, Radio, Receipt, Globe, Monitor, Star, Tag, MessageSquare, Award, ShoppingCart, Package, PenTool, Building2, Check } from "lucide-react";
import { THEMES, getTheme, setTheme, type Theme } from "@/lib/theme";

interface UserInfo {
  name: string;
  email: string;
  profileImage?: string;
}

interface BranchOption {
  _id: string;
  name: string;
  isActive: boolean;
}

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<Theme>('default');
  const [themeOpen, setThemeOpen] = useState(false);
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [activeBranchId, setActiveBranchId] = useState<string>("");
  const [switchingBranch, setSwitchingBranch] = useState(false);
  const [branchSelectorOpen, setBranchSelectorOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [institutionName, setInstitutionName] = useState<string>("");
  const [logoUrl, setLogoUrl] = useState<string>("/logo.png");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const branchSelectorRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());
  const toggleGroup = (id: string) => setOpenGroups((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const saved = sessionStorage.getItem("owner-nav-scroll");
    if (saved) nav.scrollTop = Number(saved);
  }, []);

  useEffect(() => {
    const theme = getTheme();
    setCurrentTheme(theme);
  }, []);

  useEffect(() => {
    setIsNavigating(false);
    setThemeOpen(false);
    const GP: Record<string, string[]> = {
      teaching:  ["/owner/students","/owner/attendance","/owner/homework","/owner/quiz","/owner/live","/owner/teacher-portal","/owner/forum"],
      courses:   ["/owner/courses","/owner/content","/owner/schedule","/owner/teacher-schedule","/owner/certificates"],
      members:   ["/owner/members","/owner/users"],
      commerce:  ["/owner/orders","/owner/products","/owner/coupons"],
      finance:   ["/owner/analytics","/owner/revenue","/owner/billing"],
      marketing: ["/owner/landing","/owner/reviews","/owner/notifications","/owner/banners"],
      settings:  ["/owner/branding"],
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
    const loadBranches = async () => {
      try {
        const res = await fetch("/api/owner/branches");
        if (res.ok) {
          const data: BranchOption[] = await res.json();
          setBranches(data);
          if (data.length > 0) setActiveBranchId(data[0]._id);
        }
      } catch (err) {
        console.error("Failed to load branches:", err);
      }
    };
    loadBranches();
  }, []);

  useEffect(() => {
    fetch("/api/owner/users/pending")
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setPendingCount(Array.isArray(data) ? data.length : 0))
      .catch(() => setPendingCount(0));
  }, []);

  useEffect(() => {
    fetch("/api/owner/institutions")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.name) setInstitutionName(data.name); })
      .catch(() => setInstitutionName(""));
  }, []);

  useEffect(() => {
    fetch("/api/owner/branding")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.logoUrl) setLogoUrl(data.logoUrl); })
      .catch(() => setLogoUrl("/logo.png"));
  }, []);

  const switchBranch = async (branchId: string) => {
    setSwitchingBranch(true);
    setActiveBranchId(branchId);
    try {
      await fetch("/api/owner/switch-branch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ branchId }),
      });
      window.location.reload();
    } catch (err) {
      console.error("Failed to switch branch:", err);
      setSwitchingBranch(false);
    }
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setUserDropdown(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (branchSelectorRef.current && !branchSelectorRef.current.contains(e.target as Node)) setBranchSelectorOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/me", { method: "DELETE" });
    window.location.href = "/";
  };

  const close = () => setSidebarOpen(false);

  const navLink = (href: string, icon: React.ReactNode, label: React.ReactNode) => {
    const active = pathname === href || (href !== "/owner" && pathname.startsWith(href));
    return (
      <Link href={href} onClick={() => { close(); if (!active) setIsNavigating(true); }}
        className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors ${
          active ? "menu-nav-active font-medium" : "text-gray-600 hover:bg-gray-50"
        }`}>
        <span>{icon}</span>
        <span className="flex-1 text-left">{label}</span>
      </Link>
    );
  };

  const renderGroup = (id: string, label: string, icon: React.ReactNode, paths: string[], children: React.ReactNode) => {
    const isOpen   = openGroups.has(id);
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
          onScroll={(e) => sessionStorage.setItem("owner-nav-scroll", String((e.currentTarget as HTMLElement).scrollTop))}
          className="flex-1 p-3 space-y-1 overflow-y-auto"
        >
          {navLink("/owner/dashboard", <LayoutDashboard className="w-4 h-4" />, "ภาพรวม")}

          {renderGroup("teaching", "การเรียนการสอน", <GraduationCap className="w-4 h-4" />,
            ["/owner/students","/owner/attendance","/owner/homework","/owner/quiz","/owner/live","/owner/teacher-portal","/owner/forum"],
            <>
              {navLink("/owner/students",      <School className="w-4 h-4" />,        "จัดการนักเรียน")}
              {navLink("/owner/attendance",    <ClipboardCheck className="w-4 h-4" />, "เช็คชื่อ")}
              {navLink("/owner/homework",      <FileText className="w-4 h-4" />,       "การบ้าน")}
              {navLink("/owner/quiz",          <PenTool className="w-4 h-4" />,        "ข้อสอบ")}
              {navLink("/owner/live",          <Radio className="w-4 h-4" />,          "Live Class")}
              {navLink("/owner/teacher-portal",<Monitor className="w-4 h-4" />,        "Teacher Portal")}
              {navLink("/owner/forum",         <MessageSquare className="w-4 h-4" />,  "Forum")}
            </>
          )}

          {renderGroup("courses", "คอร์สและเนื้อหา", <BookOpen className="w-4 h-4" />,
            ["/owner/courses","/owner/content","/owner/schedule","/owner/teacher-schedule","/owner/certificates"],
            <>
              {navLink("/owner/courses",        <ListChecks className="w-4 h-4" />,   "จัดการคอร์ส")}
              {navLink("/owner/content",        <BookOpen className="w-4 h-4" />,     "เนื้อหาการเรียน")}
              {navLink("/owner/schedule",       <CalendarDays className="w-4 h-4" />, "ตารางเรียน")}
              {navLink("/owner/teacher-schedule", <CalendarDays className="w-4 h-4" />, "ตารางสอน")}
              {navLink("/owner/certificates", <Award className="w-4 h-4" />,    "ใบรับรอง")}
            </>
          )}

          {renderGroup("members", "สมาชิก", <Users className="w-4 h-4" />,
            ["/owner/members","/owner/users"],
            <>
              {navLink("/owner/members", <UserCheck className="w-4 h-4" />,
                <div className="flex items-center justify-between w-full gap-2">
                  อนุมัติสมาชิก
                  {pendingCount > 0 && <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">{pendingCount}</span>}
                </div>
              )}
              {navLink("/owner/users", <UserCog className="w-4 h-4" />, "จัดการผู้ใช้")}
            </>
          )}

          {renderGroup("commerce", "ระบบขาย", <ShoppingCart className="w-4 h-4" />,
            ["/owner/orders","/owner/products","/owner/coupons"],
            <>
              {navLink("/owner/orders", <ShoppingCart className="w-4 h-4" />, "จัดการคำสั่งซื้อ")}
              {navLink("/owner/products", <Package className="w-4 h-4" />, "จัดการสินค้า")}
              {navLink("/owner/coupons", <Tag className="w-4 h-4" />, "คูปอง/โปรโมชั่น")}
            </>
          )}

          {renderGroup("finance", "รายได้และการเงิน", <TrendingUp className="w-4 h-4" />,
            ["/owner/analytics","/owner/revenue","/owner/billing"],
            <>
              {navLink("/owner/revenue",   <TrendingUp className="w-4 h-4" />, "รายได้")}
              {navLink("/owner/analytics", <BarChart2 className="w-4 h-4" />, "Analytics")}
              {navLink("/owner/billing",   <Receipt className="w-4 h-4" />,    "Billing & ใบเสร็จ")}
            </>
          )}

          {renderGroup("marketing", "การตลาด", <Globe className="w-4 h-4" />,
            ["/owner/landing","/owner/reviews","/owner/notifications","/owner/banners"],
            <>
              {navLink("/owner/landing",       <Globe className="w-4 h-4" />,   "Landing Page")}
              {navLink("/owner/reviews",       <Star className="w-4 h-4" />,    "รีวิวคอร์ส")}
              {navLink("/owner/notifications", <Bell className="w-4 h-4" />,    "แจ้งเตือน")}
              {navLink("/owner/banners",       <Images className="w-4 h-4" />,  "จัดการแบนเนอร์")}
            </>
          )}

          {renderGroup("settings", "ตั้งค่าระบบ", <Shield className="w-4 h-4" />,
            ["/owner/branding"],
            <>
              {navLink("/owner/branding", <Palette className="w-4 h-4" />, "จัดการ Branding")}
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
          <span className="hidden lg:block text-sm font-semibold theme-link">Owner Dashboard</span>

          <div className="ml-auto flex items-center gap-3">
            {institutionName && (
              <div className="relative" ref={branchSelectorRef}>
                <button
                  onClick={() => setBranchSelectorOpen(true)}
                  disabled={switchingBranch}
                  className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 theme-bg-light rounded-lg max-w-[160px] hover:opacity-80 transition-opacity disabled:opacity-50 cursor-pointer">
                  <Building2 className="w-3.5 h-3.5 theme-link shrink-0" />
                  <span className="text-sm theme-link font-medium truncate">{institutionName}</span>
                  <ChevronDown className="w-3.5 h-3.5 theme-link shrink-0 ml-auto" />
                </button>

                {branchSelectorOpen && (
                  <div className="absolute -right-2 top-full mt-3 w-64 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50 py-2">
                      {branches.map((b) => (
                      <button
                        key={b._id}
                        onClick={() => switchBranch(b._id)}
                        disabled={switchingBranch}
                        className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors ${
                          activeBranchId === b._id
                            ? "bg-violet-100 text-violet-900"
                            : "text-gray-800 hover:bg-gray-100"
                        } disabled:opacity-50`}>
                        <div className="flex items-center gap-3">
                          <Building2 className="w-4 h-4 text-violet-600 flex-shrink-0" />
                          <span className="text-left">{b.name}</span>
                        </div>
                        {activeBranchId === b._id && (
                          <Check className="w-4 h-4 text-violet-600 flex-shrink-0" />
                        )}
                      </button>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>

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
                <div className="text-sm font-medium text-gray-800 leading-tight">{user?.name || "Owner"}</div>
                <div className="text-xs theme-link leading-tight">Business Owner</div>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${userDropdown ? "rotate-180" : ""}`} />
            </button>
            {userDropdown && (
              <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                <div className="px-3 py-2 border-b border-gray-100">
                  <div className="text-sm font-medium text-gray-800">{user?.name || "Owner"}</div>
                  <div className="text-xs theme-link">Business Owner</div>
                </div>
                <Link href="/owner/profile" onClick={() => setUserDropdown(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <User className="w-4 h-4" />
                  โปรไฟล์ของฉัน
                </Link>

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
                          }`}>
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.primary }} />
                          {theme.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
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
