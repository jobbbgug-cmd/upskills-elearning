"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { LayoutDashboard, ListChecks, Users, LogOut, Images, UserCog, UserCheck, BookOpen, TrendingUp, CalendarDays, GraduationCap, Menu, X, Wallet, AlertTriangle, Palette, Shield, ShieldCheck, User, ChevronDown, Home, Building2 } from "lucide-react";
import { PLAN_LABELS } from "@/lib/planLimits";

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
  const [subscription, setSubscription]       = useState<Subscription | null>(null);
  const [sidebarOpen, setSidebarOpen]         = useState(false);
  const [userDropdown, setUserDropdown]       = useState(false);
  const [branches, setBranches]               = useState<BranchOption[]>([]);
  const [activeBranchId, setActiveBranchId]   = useState<string>("");
  const [switchingBranch, setSwitchingBranch] = useState(false);
  const dropdownRef                           = useRef<HTMLDivElement>(null);

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
        const userRole = data.user?.role ?? "";
        setRole(userRole);
        setUserName(data.user?.name ?? "");
        setUserImage(data.user?.profileImage ?? "");

        if (userRole === "owner") {
          const branchRes = await fetch("/api/owner/branches");
          if (branchRes.ok) {
            const branchData: BranchOption[] = await branchRes.json();
            setBranches(branchData);
            if (branchData.length > 0) setActiveBranchId(branchData[0]._id);
          }
        }
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
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
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
        <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
          <div className="px-3 py-2 border-b border-gray-100 sm:hidden">
            <div className="text-sm font-medium text-gray-800">{userName}</div>
            <div className="text-xs text-gray-400">{ROLE_LABELS[role] ?? role}</div>
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
          {/* admin + super_admin only */}
          {isAdmin && navLink("/admin", <LayoutDashboard className="w-4 h-4" />, "ภาพรวม")}
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
          {(isAdmin || role === "teacher") && navLink("/admin/courses", <ListChecks className="w-4 h-4" />, "จัดการคอร์ส")}
          {(isAdmin || role === "teacher") && navLink("/admin/content", <BookOpen className="w-4 h-4" />, "เนื้อหาการเรียน")}

          {/* admin + super_admin + teacher */}
          {(isAdmin || role === "teacher") && navLink("/admin/schedule", <CalendarDays className="w-4 h-4" />, "ตารางสอน")}
          {(isAdmin || role === "teacher") && navLink("/admin/revenue", <TrendingUp className="w-4 h-4" />, "รายได้")}

          {/* admin + super_admin: student schedule view */}
          {isAdmin && navLink("/dashboard/schedule", <GraduationCap className="w-4 h-4" />, "ตารางเรียน")}

          {/* super_admin only */}
          {role === "super_admin" && navLink("/admin/bookings", <Users className="w-4 h-4" />,
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
          {role === "super_admin" && navLink("/admin/roles", <Shield className="w-4 h-4" />, "จัดการ Role")}

          {/* admin only (NOT super_admin) */}
          {role === "admin" && navLink("/admin/branding", <Palette className="w-4 h-4" />, "จัดการ Branding")}

          {/* admin + super_admin */}
          {isAdmin && navLink("/admin/banners", <Images className="w-4 h-4" />, "จัดการแบนเนอร์")}
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
            className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg text-gray-500 hover:bg-gray-50 hover:text-indigo-600 transition-colors">
            <Home className="w-4 h-4" />
            กลับหน้าหลัก
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto min-w-0">
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
          <div className="ml-auto flex items-center gap-3">
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
                  {branches.map((b) => (
                    <option key={b._id} value={b._id}>{b.name}</option>
                  ))}
                </select>
              </div>
            )}
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
