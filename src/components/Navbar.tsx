"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X, User, LogOut, LayoutDashboard, CalendarDays, ShieldCheck, BookOpen, ClipboardCheck, PenLine, Award, Radio, Receipt, MessageSquare, Star, ChevronDown, ShoppingCart } from "lucide-react";
import NotificationBell from "@/components/NotificationBell";
import CoursesDropdown from "@/components/CoursesDropdown";
import ShoppingCartModal from "@/components/ShoppingCart";
import { IUser, IBranding } from "@/types";
import TrialRequestModal from "@/components/TrialRequestModal";
import { useCart } from "@/context/CartContext";

interface Category {
  name: string;
  count: number;
}

export default function Navbar() {
  const [user, setUser]               = useState<IUser | null>(null);
  const [branding, setBranding]       = useState<IBranding | null>(null);
  const [menuOpen, setMenuOpen]       = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [superAdminMenu, setSuperAdminMenu] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [pendingMembers, setPendingMembers] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [openNavDropdown, setOpenNavDropdown] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const { items } = useCart();
  const router   = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setIsNavigating(false);
    setMenuOpen(false);
    setSuperAdminMenu(false);
    setOpenNavDropdown(null);
  }, [pathname]);

  useEffect(() => {
    fetch("/api/courses/categories")
      .then((r) => r.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

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
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        const u = d.user ?? null;
        if (u) {
          setUser(u);
          // Fetch pending members count for super-admin
          if (u.role === "super_admin") {
            fetch("/api/admin/users/pending")
              .then((r) => r.json())
              .then((data) => setPendingMembers(Array.isArray(data) ? data.length : 0))
              .catch(() => {});
          }
        }
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
              {/* Online Courses - Mega Menu */}
              <CoursesDropdown />

              {/* Onsite Courses */}
              <div className="relative group">
                <button className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-indigo-600 py-3">
                  หลักสูตร Onsite
                  <ChevronDown className="w-4 h-4" />
                </button>
                <div className="absolute left-0 top-full hidden group-hover:block bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-72 z-50">
                  <Link href="/courses?type=onsite" className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                    ทั้งหมด
                  </Link>
                  {categories.map((cat) => (
                    <Link
                      key={`onsite-${cat.name}`}
                      href={`/courses?type=onsite&category=${encodeURIComponent(cat.name)}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Skill Pass */}
              <Link href="/skill-pass" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">
                Skill Pass
              </Link>

              {/* Articles */}
              <Link href="/articles" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">
                บทความ
              </Link>

              {/* For Organizations */}
              <div className="relative group">
                <button className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-indigo-600 py-3">
                  สำหรับองค์กร
                  <ChevronDown className="w-4 h-4" />
                </button>
                <div className="absolute left-0 top-full hidden group-hover:block bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-64 z-50">
                  <Link href="/corporate/training" className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                    การอบรมภายใน
                  </Link>
                  <Link href="/corporate/bulk" className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                    ซื้อเป็นชุด
                  </Link>
                  <Link href="/corporate/pricing" className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                    ราคา
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right: user actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Shopping Cart - Always visible */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg text-gray-600 hover:text-indigo-600 hover:bg-gray-50 transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {items.length}
                </span>
              )}
            </button>

            {user ? (
              <>
                <span className="text-sm text-gray-600">สวัสดี, {user.name}</span>
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
                {user.role === "super_admin" && (
                  <div className="relative">
                    <button
                      onClick={() => setSuperAdminMenu(!superAdminMenu)}
                      className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors relative"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      จัดการหลังบ้าน
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${superAdminMenu ? "rotate-180" : ""}`} />
                      {pendingMembers > 0 && (
                        <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{pendingMembers}</span>
                      )}
                    </button>
                    {superAdminMenu && (
                      <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                        {/* ภาพรวม */}
                        <Link href="/super-admin" onClick={() => setSuperAdminMenu(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          <LayoutDashboard className="w-4 h-4" />
                          ภาพรวม
                        </Link>

                        {/* แพลตฟอร์ม */}
                        <div className="border-t border-gray-100 mt-1">
                          <button onClick={() => toggleGroup("platform")} className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            <span>แพลตฟอร์ม</span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${expandedGroups.has("platform") ? "rotate-180" : ""}`} />
                          </button>
                          {expandedGroups.has("platform") && (
                            <>
                              <Link href="/super-admin/analytics" onClick={() => setSuperAdminMenu(false)} className="flex items-center gap-2 px-8 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                                Analytics
                              </Link>
                              <Link href="/super-admin/institutions" onClick={() => setSuperAdminMenu(false)} className="flex items-center gap-2 px-8 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                                สถาบัน
                              </Link>
                              <Link href="/super-admin/trials" onClick={() => setSuperAdminMenu(false)} className="flex items-center gap-2 px-8 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                                ทดลองใช้งาน
                              </Link>
                            </>
                          )}
                        </div>

                        {/* จัดการสมาชิก */}
                        <div className="border-t border-gray-100 mt-1">
                          <button onClick={() => toggleGroup("members")} className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            <span className="flex items-center gap-2">
                              จัดการสมาชิก
                              {pendingMembers > 0 && (
                                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                              )}
                            </span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${expandedGroups.has("members") ? "rotate-180" : ""}`} />
                          </button>
                          {expandedGroups.has("members") && (
                            <>
                              <Link href="/super-admin/members" onClick={() => setSuperAdminMenu(false)} className="flex items-center gap-2 px-8 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                                อนุมัติสมาชิก
                              </Link>
                              <Link href="/super-admin/users" onClick={() => setSuperAdminMenu(false)} className="flex items-center gap-2 px-8 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                                จัดการผู้ใช้
                              </Link>
                            </>
                          )}
                        </div>

                        {/* ฟีเจอร์แพลตฟอร์ม */}
                        <div className="border-t border-gray-100 mt-1">
                          <button onClick={() => toggleGroup("features")} className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            <span>ฟีเจอร์แพลตฟอร์ม</span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${expandedGroups.has("features") ? "rotate-180" : ""}`} />
                          </button>
                          {expandedGroups.has("features") && (
                            <>
                              <Link href="/super-admin/live" onClick={() => setSuperAdminMenu(false)} className="flex items-center gap-2 px-8 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                                Live Sessions
                              </Link>
                              <Link href="/super-admin/reviews" onClick={() => setSuperAdminMenu(false)} className="flex items-center gap-2 px-8 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                                รีวิวคอร์ส
                              </Link>
                              <Link href="/super-admin/forum" onClick={() => setSuperAdminMenu(false)} className="flex items-center gap-2 px-8 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                                Forum
                              </Link>
                              <Link href="/super-admin/coupons" onClick={() => setSuperAdminMenu(false)} className="flex items-center gap-2 px-8 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                                คูปองส่วนลด
                              </Link>
                            </>
                          )}
                        </div>

                        {/* จัดการเนื้อหา */}
                        <div className="border-t border-gray-100 mt-1">
                          <button onClick={() => toggleGroup("content")} className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            <span>จัดการเนื้อหา</span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${expandedGroups.has("content") ? "rotate-180" : ""}`} />
                          </button>
                          {expandedGroups.has("content") && (
                            <>
                              <Link href="/super-admin/courses" onClick={() => setSuperAdminMenu(false)} className="flex items-center gap-2 px-8 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                                จัดการคอร์ส
                              </Link>
                              <Link href="/super-admin/content" onClick={() => setSuperAdminMenu(false)} className="flex items-center gap-2 px-8 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                                เนื้อหาการเรียน
                              </Link>
                              <Link href="/super-admin/revenue" onClick={() => setSuperAdminMenu(false)} className="flex items-center gap-2 px-8 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                                รายได้
                              </Link>
                              <Link href="/super-admin/schedule" onClick={() => setSuperAdminMenu(false)} className="flex items-center gap-2 px-8 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                                ตารางสอน
                              </Link>
                            </>
                          )}
                        </div>

                        {/* จัดการระบบ */}
                        <div className="border-t border-gray-100 mt-1">
                          <button onClick={() => toggleGroup("system")} className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            <span>จัดการระบบ</span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${expandedGroups.has("system") ? "rotate-180" : ""}`} />
                          </button>
                          {expandedGroups.has("system") && (
                            <>
                              <Link href="/super-admin/finance" onClick={() => setSuperAdminMenu(false)} className="flex items-center gap-2 px-8 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                                ข้อมูลทางการเงิน
                              </Link>
                              <Link href="/super-admin/banners" onClick={() => setSuperAdminMenu(false)} className="flex items-center gap-2 px-8 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                                จัดการแบนเนอร์
                              </Link>
                              <Link href="/super-admin/roles" onClick={() => setSuperAdminMenu(false)} className="flex items-center gap-2 px-8 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                                จัดการ Role
                              </Link>
                              <Link href="/super-admin/logs" onClick={() => setSuperAdminMenu(false)} className="flex items-center gap-2 px-8 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                                ประวัติการใช้งาน
                              </Link>
                              <Link href="/super-admin/settings" onClick={() => setSuperAdminMenu(false)} className="flex items-center gap-2 px-8 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                                ตั้งค่าทั่วไป
                              </Link>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
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
            <button onClick={() => setOpenNavDropdown(openNavDropdown === "online" ? null : "online")} className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
              คอร์สออนไลน์
              <ChevronDown className={`w-4 h-4 transition-transform ${openNavDropdown === "online" ? "rotate-180" : ""}`} />
            </button>
            {openNavDropdown === "online" && (
              <div className="pl-3 space-y-1">
                {categories.map((cat) => (
                  <Link key={cat.name} href={`/courses?category=${encodeURIComponent(cat.name)}`} onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-gray-600 hover:bg-indigo-50 rounded-lg">
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
            <button onClick={() => setOpenNavDropdown(openNavDropdown === "onsite" ? null : "onsite")} className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
              หลักสูตร Onsite
              <ChevronDown className={`w-4 h-4 transition-transform ${openNavDropdown === "onsite" ? "rotate-180" : ""}`} />
            </button>
            {openNavDropdown === "onsite" && (
              <div className="pl-3 space-y-1">
                <Link href="/courses?type=onsite" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-gray-600 hover:bg-indigo-50 rounded-lg">
                  ทั้งหมด
                </Link>
                {categories.map((cat) => (
                  <Link key={`onsite-${cat.name}`} href={`/courses?type=onsite&category=${encodeURIComponent(cat.name)}`} onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-gray-600 hover:bg-indigo-50 rounded-lg">
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
            <Link href="/skill-pass" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">Skill Pass</Link>
            <Link href="/articles" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">บทความ</Link>
            <button onClick={() => setOpenNavDropdown(openNavDropdown === "corp" ? null : "corp")} className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
              สำหรับองค์กร
              <ChevronDown className={`w-4 h-4 transition-transform ${openNavDropdown === "corp" ? "rotate-180" : ""}`} />
            </button>
            {openNavDropdown === "corp" && (
              <div className="pl-3 space-y-1">
                <Link href="/corporate/training" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-gray-600 hover:bg-indigo-50 rounded-lg">
                  การอบรมภายใน
                </Link>
                <Link href="/corporate/bulk" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-gray-600 hover:bg-indigo-50 rounded-lg">
                  ซื้อเป็นชุด
                </Link>
                <Link href="/corporate/pricing" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-gray-600 hover:bg-indigo-50 rounded-lg">
                  ราคา
                </Link>
              </div>
            )}
            {user ? (
              <>

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
                    <div className="border-t border-gray-100 my-1"></div>
                    <div className="px-3 py-2">
                      <p className="text-xs font-medium text-gray-500 mb-1">จัดการสมาชิก</p>
                      <Link href="/super-admin/members" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 pl-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg">
                        อนุมัติสมาชิก
                        {pendingMembers > 0 && (
                          <span className="ml-auto w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{pendingMembers}</span>
                        )}
                      </Link>
                      <Link href="/super-admin/users" onClick={() => setMenuOpen(false)} className="block pl-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg">จัดการผู้ใช้</Link>
                    </div>
                    <div className="border-t border-gray-100 my-1"></div>
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

        {/* Shopping Cart Modal */}
        <ShoppingCartModal isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      </div>
    </nav>
  );
}
