import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Course from "@/models/Course";
import Booking from "@/models/Booking";
import User from "@/models/User";
import CourseContent from "@/models/CourseContent";
import Institution from "@/models/Institution";
import {
  BookOpen, Clock3, CheckCircle2, TrendingUp,
  FileText, GraduationCap, ArrowRight, UserCheck, Building2,
  BarChart2,
} from "lucide-react";
import mongoose from "mongoose";
import BranchFilter from "./_components/BranchFilter";
import DashboardCharts from "./_components/DashboardCharts";

async function getStats(role: string, userId: string, institutionId?: string, allBranchIds?: string[]) {
  await connectDB();

  const tenantClause: Record<string, unknown> = allBranchIds
    ? { institutionId: { $in: allBranchIds } }
    : institutionId ? { institutionId } : {};

  const courseFilter = role === "teacher"
    ? { ...tenantClause, instructorId: userId }
    : tenantClause;

  const courses = await Course.find(courseFilter).select("_id price isActive").lean();
  const courseIds = courses.map((c) => c._id as mongoose.Types.ObjectId);

  let commissionRate = 0;
  const rateSourceId = allBranchIds?.[0] ?? institutionId;
  if (rateSourceId) {
    const inst = await Institution.findById(rateSourceId).select("commissionRate").lean() as { commissionRate?: number } | null;
    commissionRate = inst?.commissionRate ?? 0;
  }

  const [totalContent, pendingBookings, confirmedBookings, totalStudents, pendingUsers] = await Promise.all([
    role === "admin" ? CourseContent.countDocuments(tenantClause) : Promise.resolve(0),
    Booking.countDocuments({ status: "pending_payment", courseId: { $in: courseIds } }),
    Booking.countDocuments({ status: "confirmed", courseId: { $in: courseIds } }),
    User.countDocuments({ role: "student", status: "approved", ...tenantClause }),
    User.countDocuments({ role: "student", status: "pending", ...tenantClause }),
  ]);

  const activeCourses = (courses as unknown as { isActive: boolean }[]).filter((c) => c.isActive).length;

  const [revPipeline, pendPipeline] = await Promise.all([
    Booking.aggregate([
      { $match: { status: "confirmed", courseId: { $in: courseIds } } },
      { $lookup: { from: "courses", localField: "courseId", foreignField: "_id", as: "course" } },
      { $unwind: "$course" },
      { $group: { _id: null, gross: { $sum: "$course.price" } } },
    ]),
    Booking.aggregate([
      { $match: { status: "pending_payment", courseId: { $in: courseIds } } },
      { $lookup: { from: "courses", localField: "courseId", foreignField: "_id", as: "course" } },
      { $unwind: "$course" },
      { $group: { _id: null, gross: { $sum: "$course.price" } } },
    ]),
  ]);

  const revenue = Math.round((revPipeline[0]?.gross ?? 0) * (1 - commissionRate / 100));
  const pendingRevenue = Math.round((pendPipeline[0]?.gross ?? 0) * (1 - commissionRate / 100));

  return { totalCourses: courses.length, activeCourses, totalContent, pendingBookings, confirmedBookings, totalStudents, pendingUsers, revenue, pendingRevenue, commissionRate };
}

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ branchId?: string }> }) {
  const auth = await getAuthUser();
  if (!auth || (auth.role !== "admin" && auth.role !== "teacher" && auth.role !== "owner")) redirect("/login");

  const { branchId } = await searchParams;
  const isAdmin = auth.role === "admin";

  interface BranchOption { _id: string; name: string; }
  let branches: BranchOption[] = [];
  let statsInstitutionId: string | undefined = auth.institutionId;
  let allBranchIds: string[] | undefined;
  let selectedBranchId = branchId ?? auth.institutionId ?? "";
  let displayName = "";

  if (auth.isOwner && auth.institutionId) {
    await connectDB();
    const [parent, children] = await Promise.all([
      Institution.findById(auth.institutionId).select("_id name").lean() as unknown as Promise<{ _id: mongoose.Types.ObjectId; name: string } | null>,
      Institution.find({ parentId: auth.institutionId }).select("_id name").sort({ createdAt: 1 }).lean() as unknown as Promise<{ _id: mongoose.Types.ObjectId; name: string }[]>,
    ]);
    if (parent) {
      branches = [
        { _id: parent._id.toString(), name: `${parent.name} (หลัก)` },
        ...children.map((b) => ({ _id: b._id.toString(), name: b.name })),
      ];
    }
    if (!branchId) {
      selectedBranchId = auth.institutionId;
      statsInstitutionId = auth.institutionId;
      displayName = branches[0]?.name ?? "";
    } else if (branchId === "all") {
      allBranchIds = branches.map((b) => b._id);
      statsInstitutionId = undefined;
      displayName = "ทุกสาขา";
    } else {
      const match = branches.find((b) => b._id === branchId);
      if (match) {
        statsInstitutionId = branchId;
        displayName = match.name;
      } else {
        statsInstitutionId = auth.institutionId;
        selectedBranchId = auth.institutionId;
        displayName = branches[0]?.name ?? "";
      }
    }
  } else if (auth.institutionId) {
    const inst = await connectDB().then(() =>
      Institution.findById(auth.institutionId).select("name").lean() as Promise<{ name: string } | null>
    );
    displayName = inst?.name ?? "";
  }

  const stats = await getStats(auth.role, auth.userId, statsInstitutionId, allBranchIds);

  const today = new Date().toLocaleDateString("th-TH", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-indigo-500" />
            ภาพรวม{isAdmin ? "ระบบ" : "คอร์สของฉัน"}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">{today}</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {auth.isOwner && branches.length > 1 && (
            <BranchFilter branches={branches} selected={selectedBranchId} />
          )}
          {displayName && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full theme-badge">
              <Building2 className="w-3.5 h-3.5" />{displayName}
            </span>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="นักเรียนทั้งหมด"
          value={stats.totalStudents.toLocaleString()}
          sub={stats.pendingUsers > 0 ? `รออนุมัติ ${stats.pendingUsers} คน` : "ไม่มีรอดำเนินการ"}
          accent="from-indigo-500 to-violet-600"
          icon={<GraduationCap className="w-5 h-5 text-white" />}
          href="/owner/members"
        />
        <KpiCard
          label="คอร์สที่เปิดสอน"
          value={`${stats.activeCourses}/${stats.totalCourses}`}
          sub="คอร์สที่เปิด / ทั้งหมด"
          accent="from-teal-500 to-emerald-500"
          icon={<BookOpen className="w-5 h-5 text-white" />}
          href="/owner/courses"
        />
        <KpiCard
          label="การจองยืนยันแล้ว"
          value={stats.confirmedBookings.toLocaleString()}
          sub={`รอชำระ ${stats.pendingBookings} รายการ`}
          accent="from-amber-400 to-orange-500"
          icon={<CheckCircle2 className="w-5 h-5 text-white" />}
          href="/owner/bookings"
        />
        <KpiCard
          label="รายได้รับแล้ว"
          value={`฿${stats.revenue.toLocaleString()}`}
          sub={stats.commissionRate > 0 ? `หักค่าคอม ${stats.commissionRate}% แล้ว` : "ยังไม่หักค่าคอม"}
          accent="from-rose-500 to-pink-500"
          icon={<TrendingUp className="w-5 h-5 text-white" />}
          href="/owner/revenue"
        />
      </div>

      {/* Revenue Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <RevCard
          label="รายได้รับแล้ว"
          amount={stats.revenue}
          sub={`${stats.confirmedBookings} การจอง${stats.commissionRate > 0 ? ` · หักค่าคอม ${stats.commissionRate}%` : ""}`}
          borderColor="border-l-emerald-500"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
        />
        <RevCard
          label="รอดำเนินการ"
          amount={stats.pendingRevenue}
          sub={`${stats.pendingBookings} รอชำระ${stats.commissionRate > 0 ? ` · หักค่าคอม ${stats.commissionRate}%` : ""}`}
          borderColor="border-l-amber-500"
          icon={<Clock3 className="w-5 h-5 text-amber-600" />}
        />
        <RevCard
          label="รายรับรวม (ถ้าชำระครบ)"
          amount={stats.revenue + stats.pendingRevenue}
          sub={`${stats.confirmedBookings + stats.pendingBookings} การจองทั้งหมด`}
          borderColor="border-l-indigo-500"
          icon={<TrendingUp className="w-5 h-5 text-indigo-600" />}
        />
      </div>

      {/* Charts */}
      {isAdmin && (
        <DashboardCharts branchId={selectedBranchId} />
      )}

      {/* Quick links */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">เมนูลัด</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { href: "/owner/courses",  icon: BookOpen,     label: "จัดการคอร์ส",     desc: "เพิ่ม แก้ไข ลบ กำหนดรอบเรียน", color: "bg-indigo-50 text-indigo-500 group-hover:bg-indigo-100" },
            { href: "/owner/bookings", icon: CheckCircle2, label: "ตรวจสอบการชำระ",  desc: "ตรวจสลิปและอนุมัติการจอง",       color: "bg-green-50 text-green-500 group-hover:bg-green-100" },
            { href: "/owner/members",  icon: UserCheck,    label: "อนุมัติสมาชิก",    desc: "ตรวจสอบและอนุมัตินักเรียนใหม่", color: "bg-teal-50 text-teal-500 group-hover:bg-teal-100" },
            { href: "/owner/revenue",  icon: TrendingUp,   label: "รายงานรายได้",     desc: "ดูรายงานรายได้และสถิติ",          color: "bg-rose-50 text-rose-500 group-hover:bg-rose-100" },
            { href: "/owner/content",  icon: FileText,     label: "เนื้อหาการเรียน", desc: "จัดการคลิป PPT ไฟล์ดาวน์โหลด",  color: "bg-purple-50 text-purple-500 group-hover:bg-purple-100" },
            { href: "
              ", icon: BarChart2,    label: "ตารางสอน",         desc: "ดูตารางการสอนรายเดือน",           color: "bg-amber-50 text-amber-500 group-hover:bg-amber-100" },
          ].map(({ href, icon: Icon, label, desc, color }) => (
            <Link key={href} href={href}
              className="bg-white rounded-2xl border border-gray-100 p-4 hover:border-indigo-200 hover:shadow-sm transition-all group flex items-start gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${color}`}>
                <Icon className="w-4.5 h-4.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-900 text-sm group-hover:text-indigo-600 transition-colors">{label}</p>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 transition-colors shrink-0" />
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function KpiCard({ label, value, sub, accent, icon, href }: {
  label: string; value: string; sub: string;
  accent: string; icon: React.ReactNode; href: string;
}) {
  return (
    <Link href={href} className="group relative bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all overflow-hidden">
      <div className={`absolute top-0 right-0 w-20 h-20 rounded-full bg-gradient-to-br ${accent} opacity-5 -mr-6 -mt-6`} />
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${accent} mb-3 shadow-sm`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-0.5">{value}</div>
      <div className="text-xs font-semibold text-gray-600">{label}</div>
      <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
    </Link>
  );
}

function RevCard({ label, amount, sub, borderColor, icon }: {
  label: string; amount: number; sub: string; borderColor: string; icon: React.ReactNode;
}) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 border-l-4 ${borderColor} p-5`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-gray-700 text-sm font-medium">{label}</span>
        {icon}
      </div>
      <div className="text-3xl font-extrabold mb-1 text-gray-900">฿{amount.toLocaleString()}</div>
      <div className="text-gray-500 text-xs">{sub}</div>
    </div>
  );
}
