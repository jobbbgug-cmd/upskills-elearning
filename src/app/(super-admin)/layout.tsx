"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Building2, LogOut, Menu, X, ShieldCheck, Receipt,
} from "lucide-react";
import { useState } from "react";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const close = () => setOpen(false);

  const nav = (href: string, icon: React.ReactNode, label: string) => {
    const active = pathname === href || (href !== "/super-admin" && pathname.startsWith(href));
    return (
      <Link
        href={href}
        onClick={close}
        className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors ${
          active
            ? "bg-violet-50 text-violet-700 font-medium"
            : "text-gray-600 hover:bg-gray-50 hover:text-violet-600"
        }`}
      >
        {icon}
        {label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {open && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={close} />}

      <aside className={`fixed inset-y-0 left-0 z-50 w-60 bg-white border-r border-gray-200 flex flex-col shrink-0 transition-transform duration-200
        ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:transform-none`}>

        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <Link href="/" onClick={close}>
              <Image src="/logo.png" alt="UPSkills" width={120} height={40} className="object-contain" />
            </Link>
            <div className="flex items-center gap-1.5 mt-2">
              <ShieldCheck className="w-3.5 h-3.5 text-violet-600" />
              <span className="text-xs font-semibold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full">Super Admin</span>
            </div>
          </div>
          <button onClick={close} className="lg:hidden p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {nav("/super-admin", <LayoutDashboard className="w-4 h-4" />, "ภาพรวมแพลตฟอร์ม")}
          {nav("/super-admin/institutions", <Building2 className="w-4 h-4" />, "สถาบันทั้งหมด")}
          {nav("/super-admin/payouts", <Receipt className="w-4 h-4" />, "Commission & Payout")}
        </nav>

        <div className="p-3 border-t border-gray-100">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            กลับหน้าหลัก
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-auto min-w-0">
        <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setOpen(true)}
            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-sm font-semibold text-violet-700">Super Admin</span>
        </div>
        <div className="max-w-6xl mx-auto p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
