"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Building2, LogOut, Menu, X, ShieldCheck,
  Users, Wallet, Home, CalendarDays, Settings, User, ChevronDown, Palette,
  AlertTriangle
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { THEMES, getTheme, setTheme, type Theme } from "@/lib/theme";

interface UserInfo {
  name: string;
  email: string;
  profileImage?: string;
}

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<Theme>('default');
  const [themeOpen, setThemeOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const close = () => setOpen(false);

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
  }, [pathname]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.user) setUser({ name: d.user.name, email: d.user.email, profileImage: d.user.profileImage }); });
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
          onScroll={(e) => sessionStorage.setItem("owner-nav-scroll", String((e.currentTarget as HTMLElement).scrollTop))}
          className="flex-1 p-3 space-y-1 overflow-y-auto"
        >
          <Link href="/owner/dashboard" onClick={close}
            className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors ${
              pathname === "/owner/dashboard" ? "menu-nav-active font-medium" : "text-gray-600 hover:bg-gray-50"
            }`}>
            <LayoutDashboard className="w-4 h-4" />
            <span>แดชบอร์ด</span>
          </Link>

          <div className="pt-4 pb-1">
            <div className="text-xs font-semibold text-gray-400 uppercase px-3">บริหารจัดการ</div>
          </div>

          <Link href="/owner/branches" onClick={close}
            className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors ${
              pathname.startsWith("/owner/branches") ? "menu-nav-active font-medium" : "text-gray-600 hover:bg-gray-50"
            }`}>
            <Building2 className="w-4 h-4" />
            <span>จัดการสาขา</span>
          </Link>

          <Link href="/owner/schedule" onClick={close}
            className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors ${
              pathname.startsWith("/owner/schedule") ? "menu-nav-active font-medium" : "text-gray-600 hover:bg-gray-50"
            }`}>
            <CalendarDays className="w-4 h-4" />
            <span>ตารางเรียน</span>
          </Link>

          <Link href="/owner/members" onClick={close}
            className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors ${
              pathname.startsWith("/owner/members") ? "menu-nav-active font-medium" : "text-gray-600 hover:bg-gray-50"
            }`}>
            <Users className="w-4 h-4" />
            <span>จัดการสมาชิก</span>
          </Link>

          <div className="pt-4 pb-1">
            <div className="text-xs font-semibold text-gray-400 uppercase px-3">การเงิน</div>
          </div>

          <Link href="/owner/revenue" onClick={close}
            className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors ${
              pathname.startsWith("/owner/revenue") ? "menu-nav-active font-medium" : "text-gray-600 hover:bg-gray-50"
            }`}>
            <Wallet className="w-4 h-4" />
            <span>รายได้</span>
          </Link>

          <div className="pt-4 pb-1">
            <div className="text-xs font-semibold text-gray-400 uppercase px-3">ระบบ</div>
          </div>

          <Link href="/owner/settings" onClick={close}
            className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors ${
              pathname.startsWith("/owner/settings") ? "menu-nav-active font-medium" : "text-gray-600 hover:bg-gray-50"
            }`}>
            <Settings className="w-4 h-4" />
            <span>ตั้งค่า</span>
          </Link>
        </nav>

        <div className="p-3 border-t border-gray-100 space-y-0.5">
          <Link href="/" onClick={close}
            className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg text-gray-500 hover:bg-gray-50 hover:text-violet-600 transition-colors">
            <Home className="w-4 h-4" />
            กลับหน้าหลัก
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg text-red-500 hover:bg-red-50 transition-colors">
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

        <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-3">
          <button
            onClick={() => setOpen(true)}
            className="lg:hidden p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/" className="lg:hidden">
            <Image src="/logo.png" alt="UPSkills" width={100} height={34} className="object-contain" />
          </Link>
          <span className="hidden lg:block text-sm font-semibold theme-link">Owner Dashboard</span>

          <div className="ml-auto relative" ref={dropdownRef}>
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
