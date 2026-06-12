"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X, User, LogOut, LayoutDashboard, CalendarDays } from "lucide-react";
import { IUser } from "@/types";

export default function Navbar() {
  const [user, setUser]       = useState<IUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router   = useRouter();
  const pathname = usePathname();
  const isHome   = pathname === "/";

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => d.user && setUser(d.user))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  const logout = async () => {
    await fetch("/api/auth/me", { method: "DELETE" });
    setUser(null);
    router.push("/");
    router.refresh();
  };

  // transparent = homepage + not scrolled + mobile menu closed
  const transparent = isHome && !scrolled && !menuOpen;

  const navBg    = transparent ? "bg-transparent border-transparent" : "bg-white border-b border-gray-200";
  const textCls  = transparent ? "text-white/90 hover:text-white"   : "text-gray-600 hover:text-indigo-600";
  const iconCls  = transparent ? "text-white"                        : "text-gray-600";
  const nameCls  = transparent ? "text-white/80"                     : "text-gray-600";

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${navBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">

          {/* Left: logo + nav links */}
          <div className="flex items-center gap-8">
            <Link href="/">
              <Image
                src="/icon.png"
                alt="UPSkills"
                width={40}
                height={40}
                className="object-contain"
                priority
              />
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link href="/courses" className={`text-sm font-medium transition-colors ${textCls}`}>
                คอร์สทั้งหมด
              </Link>
            </div>
          </div>

          {/* Right: user actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <span className={`text-sm transition-colors ${nameCls}`}>สวัสดี, {user.name}</span>
                <Link href="/dashboard" className={`flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg transition-colors ${
                  transparent ? "text-white/90 hover:text-white hover:bg-white/10" : "text-gray-600 hover:text-indigo-600 hover:bg-gray-50"
                }`}>
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                {user.role === "student" && (
                  <Link href="/dashboard/schedule" className={`flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg transition-colors ${
                    transparent ? "text-white/90 hover:text-white hover:bg-white/10" : "text-gray-600 hover:text-indigo-600 hover:bg-gray-50"
                  }`}>
                    <CalendarDays className="w-4 h-4" />
                    ตารางเรียน
                  </Link>
                )}
                {user.role === "admin" && (
                  <Link href="/admin" className={`flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
                    transparent ? "text-white hover:bg-white/10" : "text-indigo-600 hover:bg-indigo-50"
                  }`}>
                    <User className="w-4 h-4" />
                    Admin
                  </Link>
                )}
                {user.role === "teacher" && (
                  <Link href="/dashboard" className={`flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
                    transparent ? "text-white hover:bg-white/10" : "text-green-600 hover:bg-green-50"
                  }`}>
                    <User className="w-4 h-4" />
                    ครู
                  </Link>
                )}
                <button onClick={logout} className={`flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg transition-colors ${
                  transparent ? "text-white/70 hover:text-white hover:bg-white/10" : "text-gray-500 hover:text-red-600 hover:bg-red-50"
                }`}>
                  <LogOut className="w-4 h-4" />
                  ออกจากระบบ
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className={`text-sm px-4 py-2 rounded-lg transition-colors ${
                  transparent ? "text-white/90 hover:text-white hover:bg-white/10" : "text-gray-600 hover:text-indigo-600 hover:bg-gray-50"
                }`}>
                  เข้าสู่ระบบ
                </Link>
                <Link href="/register" className={`text-sm font-semibold px-4 py-2 rounded-lg transition-colors ${
                  transparent
                    ? "bg-white/20 text-white hover:bg-white/30 border border-white/30"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                }`}>
                  สมัครสมาชิก
                </Link>
              </>
            )}
          </div>

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`md:hidden flex items-center p-2 transition-colors ${iconCls}`}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-1 border-t border-white/20 pt-3 bg-white/95 backdrop-blur-sm rounded-b-2xl -mx-4 px-4">
            <Link href="/courses" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">คอร์สทั้งหมด</Link>
            {user ? (
              <>
                <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">Dashboard</Link>
                {user.role === "student" && (
                  <Link href="/dashboard/schedule" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">ตารางเรียน</Link>
                )}
                {user.role === "admin" && (
                  <Link href="/admin" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-indigo-600 font-medium hover:bg-indigo-50 rounded-lg">Admin</Link>
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
