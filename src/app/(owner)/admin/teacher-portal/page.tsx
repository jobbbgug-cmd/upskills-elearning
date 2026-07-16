"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, Users, TrendingUp, FileText, ChevronRight, CheckCircle2 } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

interface CourseStats { _id: string; title: string; price: number; isActive: boolean; enrolled: number; }
interface HwSub {
  _id: string; status: string; submittedAt: string;
  studentId?: { name: string };
  homeworkId?: { title: string; courseId: string } | null;
}
interface Stats {
  totalCourses: number; activeCourses: number; totalStudents: number; totalRevenue: number;
  courseStats: CourseStats[]; pendingHomework: HwSub[];
}

export default function TeacherPortalPage() {
  const [data, setData] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/teacher/stats")
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!data)   return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Teacher Portal</h1>
        <p className="text-gray-500 text-sm mt-1">ภาพรวมคอร์สและนักเรียนของคุณ</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "คอร์สทั้งหมด",       value: data.totalCourses,                  sub: `เปิดอยู่ ${data.activeCourses} คอร์ส`, color: "from-indigo-500 to-violet-600" },
          { label: "นักเรียนรวม",          value: data.totalStudents,                 sub: "ที่ลงทะเบียนในคอร์สคุณ",              color: "from-teal-500 to-emerald-500" },
          { label: "รอตรวจการบ้าน",        value: data.pendingHomework.length,        sub: "รายการ",                               color: "from-amber-400 to-orange-500" },
          { label: "รายได้ประมาณการ",      value: `฿${data.totalRevenue.toLocaleString()}`, sub: "รวมทุกคอร์ส",                color: "from-rose-500 to-pink-500" },
        ].map((k, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-20 h-20 rounded-full bg-gradient-to-br ${k.color} opacity-5 -mr-6 -mt-6`} />
            <p className="text-2xl font-bold text-gray-900">{k.value}</p>
            <p className="text-xs font-semibold text-gray-600 mt-0.5">{k.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course list */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2"><BookOpen className="w-4 h-4 text-indigo-500" />คอร์สของคุณ</h2>
            <Link href="/admin/courses" className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1">จัดการ <ChevronRight className="w-3 h-3" /></Link>
          </div>
          {data.courseStats.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-300 text-sm">ยังไม่มีคอร์ส</div>
          ) : (
            <div className="space-y-2.5">
              {data.courseStats.map((c) => (
                <div key={c._id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${c.isActive ? "bg-indigo-50" : "bg-gray-100"}`}>
                    <BookOpen className={`w-4 h-4 ${c.isActive ? "text-indigo-500" : "text-gray-300"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate text-sm">{c.title}</p>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{c.enrolled} คน</span>
                      <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />฿{(c.price * c.enrolled).toLocaleString()}</span>
                    </div>
                  </div>
                  {!c.isActive && <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full shrink-0">ปิด</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending homework */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2"><FileText className="w-4 h-4 text-amber-500" />รอตรวจการบ้าน</h2>
            <Link href="/admin/homework" className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1">ดูทั้งหมด <ChevronRight className="w-3 h-3" /></Link>
          </div>
          {data.pendingHomework.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
              <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400">ตรวจการบ้านครบแล้ว!</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {data.pendingHomework.map((sub) => (
                <div key={sub._id} className="bg-white rounded-xl border border-amber-100 p-4 flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{sub.homeworkId?.title ?? "การบ้าน"}</p>
                    <p className="text-xs text-gray-400 mt-0.5">ส่งโดย: {(sub as unknown as { studentId?: { name: string } }).studentId?.name ?? "—"}</p>
                  </div>
                  <Link
                    href={sub.homeworkId?.courseId ? `/admin/homework` : "/admin/homework"}
                    className="shrink-0 text-xs text-indigo-500 hover:text-indigo-700 font-medium flex items-center gap-1">
                    ตรวจ <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">เมนูลัด</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: "/admin/attendance", label: "เช็คชื่อ",    color: "bg-green-50 text-green-600"  },
            { href: "/admin/quiz",       label: "ข้อสอบ",       color: "bg-rose-50  text-rose-600"   },
            { href: "/admin/live",       label: "Live Class",  color: "bg-red-50   text-red-600"    },
            { href: "/admin/schedule",   label: "ตารางสอน",   color: "bg-blue-50  text-blue-600"   },
          ].map((link) => (
            <Link key={link.href} href={link.href}
              className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold ${link.color} hover:opacity-80 transition-opacity`}>
              {link.label} <ChevronRight className="w-4 h-4" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
