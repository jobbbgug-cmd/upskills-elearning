"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, X, User, LogOut, LayoutDashboard, CalendarDays } from "lucide-react";
import { IUser } from "@/types";

export default function Navbar() {
  const [user, setUser] = useState<IUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => d.user && setUser(d.user))
      .catch(() => {});
  }, []);

  const logout = async () => {
    await fetch("/api/auth/me", { method: "DELETE" });
    setUser(null);
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/">
              <Image src="/logo.png" alt="UPSkills" width={120} height={40} className="object-contain" priority />
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link href="/courses" className="text-gray-600 hover:text-indigo-600 text-sm font-medium transition-colors">
                คอร์สทั้งหมด
              </Link>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-gray-600">สวัสดี, {user.name}</span>
                <Link href="/dashboard" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-lg hover:bg-gray-50">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                {user.role === "student" && (
                  <Link href="/dashboard/schedule" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-lg hover:bg-gray-50">
                    <CalendarDays className="w-4 h-4" />
                    ตารางเรียน
                  </Link>
                )}
                {user.role === "admin" && (
                  <Link href="/admin" className="flex items-center gap-1.5 text-sm text-indigo-600 font-medium px-3 py-2 rounded-lg hover:bg-indigo-50">
                    <User className="w-4 h-4" />
                    Admin
                  </Link>
                )}
                {user.role === "teacher" && (
                  <Link href="/dashboard" className="flex items-center gap-1.5 text-sm text-green-600 font-medium px-3 py-2 rounded-lg hover:bg-green-50">
                    <User className="w-4 h-4" />
                    ครู
                  </Link>
                )}
                <button onClick={logout} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-red-50">
                  <LogOut className="w-4 h-4" />
                  ออกจากระบบ
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm text-gray-600 hover:text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-50">
                  เข้าสู่ระบบ
                </Link>
                <Link href="/register" className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                  สมัครสมาชิก
                </Link>
              </>
            )}
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden flex items-center p-2">
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-4 space-y-2 border-t border-gray-100 pt-3">
            <Link href="/courses" className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">คอร์สทั้งหมด</Link>
            {user ? (
              <>
                <Link href="/dashboard" className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">Dashboard</Link>
                {user.role === "student" && (
                  <Link href="/dashboard/schedule" className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">ตารางเรียน</Link>
                )}
                {user.role === "admin" && (
                  <Link href="/admin" className="block px-3 py-2 text-sm text-indigo-600 font-medium hover:bg-indigo-50 rounded-lg">Admin</Link>
                )}
                <button onClick={logout} className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">ออกจากระบบ</button>
              </>
            ) : (
              <>
                <Link href="/login" className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">เข้าสู่ระบบ</Link>
                <Link href="/register" className="block px-3 py-2 text-sm text-indigo-600 font-medium hover:bg-indigo-50 rounded-lg">สมัครสมาชิก</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
