import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Course from "@/models/Course";
import Booking from "@/models/Booking";
import User from "@/models/User";
import CourseContent from "@/models/CourseContent";
import {
  BookOpen, Users, Clock3, CheckCircle2, TrendingUp,
  FileText, GraduationCap, ArrowRight, UserCheck,
} from "lucide-react";
import mongoose from "mongoose";

async function getStats(role: string, userId: string) {
  await connectDB();

  const courseFilter = role === "admin" ? {} : { instructorId: userId };
  const courses = await Course.find(courseFilter).select("_id price isActive").lean();
  const courseIds = courses.map((c) => c._id as mongoose.Types.ObjectId);

  const [
    totalContent,
    pendingBookings,
    confirmedBookings,
    totalStudents,
    pendingUsers,
    activeCourses,
  ] = await Promise.all([
    role === "admin" ? CourseContent.countDocuments() : Promise.resolve(0),
    Booking.countDocuments({ status: "pending_payment", courseId: { $in: courseIds } }),
    Booking.countDocuments({ status: "confirmed",       courseId: { $in: courseIds } }),
    User.countDocuments({ role: "student", status: "approved" }),
    User.countDocuments({ role: "student", status: "pending" }),
    courses.filter((c) => c.isActive).length,
  ]);

  // Revenue: sum price of confirmed bookings
  const revenuePipeline = await Booking.aggregate([
    { $match: { status: "confirmed", courseId: { $in: courseIds } } },
    { $lookup: { from: "courses", localField: "courseId", foreignField: "_id", as: "course" } },
    { $unwind: "$course" },
    { $group: { _id: null, total: { $sum: "$course.price" } } },
  ]);
  const revenue = revenuePipeline[0]?.total ?? 0;

  // Pending revenue (pending_payment)
  const pendingRevenuePipeline = await Booking.aggregate([
    { $match: { status: "pending_payment", courseId: { $in: courseIds } } },
    { $lookup: { from: "courses", localField: "courseId", foreignField: "_id", as: "course" } },
    { $unwind: "$course" },
    { $group: { _id: null, total: { $sum: "$course.price" } } },
  ]);
  const pendingRevenue = pendingRevenuePipeline[0]?.total ?? 0;

  return {
    totalCourses: courses.length,
    activeCourses,
    totalContent,
    pendingBookings,
    confirmedBookings,
    totalStudents,
    pendingUsers,
    revenue,
    pendingRevenue,
  };
}

export default async function AdminPage() {
  const auth = await getAuthUser();
  if (!auth || (auth.role !== "admin" && auth.role !== "teacher")) redirect("/login");

  const stats = await getStats(auth.role, auth.userId);
  const isAdmin   = auth.role === "admin";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ภาพรวม{isAdmin ? "ระบบ" : "คอร์สของฉัน"}</h1>
        <p className="text-gray-500 text-sm mt-1">ยินดีต้อนรับ, {auth.name}</p>
      </div>

      {/* Main stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="คอร์สทั้งหมด"
          value={stats.totalCourses}
          sub={`เปิดสอน ${stats.activeCourses} คอร์ส`}
          icon={BookOpen}
          color="indigo"
          href="/admin/courses"
        />
        {isAdmin && (
          <StatCard
            label="เนื้อหาการเรียน"
            value={stats.totalContent}
            sub="ชุดเนื้อหา"
            icon={FileText}
            color="purple"
            href="/admin/content"
          />
        )}
        <StatCard
          label="นักเรียนที่อนุมัติแล้ว"
          value={stats.totalStudents}
          sub={stats.pendingUsers > 0 ? `รออนุมัติ ${stats.pendingUsers} คน` : "ไม่มีรอดำเนินการ"}
          icon={GraduationCap}
          color="teal"
          href="/admin/members"
        />
        <StatCard
          label="การจองที่อนุมัติ"
          value={stats.confirmedBookings}
          sub="รอบที่ยืนยันแล้ว"
          icon={CheckCircle2}
          color="green"
          href="/admin/bookings"
        />
      </div>

      {/* Financial stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Revenue confirmed */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <span className="text-green-100 text-sm font-medium">รายได้รับแล้ว</span>
            <CheckCircle2 className="w-5 h-5 text-green-200" />
          </div>
          <div className="text-3xl font-extrabold mb-1">
            ฿{stats.revenue.toLocaleString()}
          </div>
          <div className="text-green-100 text-xs">{stats.confirmedBookings} การจองที่ชำระแล้ว</div>
        </div>

        {/* Pending revenue */}
        <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <span className="text-amber-100 text-sm font-medium">รอดำเนินการ</span>
            <Clock3 className="w-5 h-5 text-amber-200" />
          </div>
          <div className="text-3xl font-extrabold mb-1">
            ฿{stats.pendingRevenue.toLocaleString()}
          </div>
          <div className="text-amber-100 text-xs">{stats.pendingBookings} การจองรอชำระ</div>
        </div>

        {/* Total potential */}
        <div className="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <span className="text-indigo-100 text-sm font-medium">รายรับรวม (ถ้าชำระครบ)</span>
            <TrendingUp className="w-5 h-5 text-indigo-200" />
          </div>
          <div className="text-3xl font-extrabold mb-1">
            ฿{(stats.revenue + stats.pendingRevenue).toLocaleString()}
          </div>
          <div className="text-indigo-100 text-xs">{stats.confirmedBookings + stats.pendingBookings} การจองทั้งหมด</div>
        </div>
      </div>

      {/* Booking status breakdown */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-900 mb-4">สถานะการจอง</h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
          <BookingStatusRow
            label="รอชำระเงิน"
            count={stats.pendingBookings}
            color="amber"
            href="/admin/bookings"
          />
          <BookingStatusRow
            label="ชำระแล้ว / อนุมัติ"
            count={stats.confirmedBookings}
            color="green"
            href="/admin/bookings"
          />
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { href: "/admin/courses",  icon: BookOpen,     label: "จัดการคอร์ส",           desc: "เพิ่ม แก้ไข ลบ กำหนดรอบเรียน" },
          { href: "/admin/bookings", icon: CheckCircle2, label: "ตรวจสอบการชำระ",        desc: "ตรวจสลิปและอนุมัติการจอง" },
          { href: "/admin/members",  icon: UserCheck,    label: "อนุมัติสมาชิก",          desc: "ตรวจสอบและอนุมัตินักเรียนใหม่" },
          { href: "/admin/revenue",  icon: TrendingUp,   label: "รายงานรายได้",           desc: "ดูรายงานรายได้และสถิติ" },
          { href: "/admin/content",  icon: FileText,     label: "เนื้อหาการเรียน",        desc: "จัดการคลิป PPT ไฟล์ดาวน์โหลด" },
          { href: "/admin/finance",  icon: CheckCircle2, label: "ข้อมูลทางการเงิน",       desc: "บัญชีธนาคาร QR Code" },
        ].map(({ href, icon: Icon, label, desc }) => (
          <Link key={href} href={href}
            className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-indigo-200 hover:shadow-sm transition-all group flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 group-hover:bg-indigo-100 transition-colors">
              <Icon className="w-4.5 h-4.5 text-indigo-500" />
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
  );
}

/* ── Shared components ── */

type ColorKey = "indigo" | "green" | "purple" | "teal" | "amber";

const colorMap: Record<ColorKey, { icon: string; text: string; sub: string }> = {
  indigo: { icon: "bg-indigo-50 text-indigo-600", text: "text-indigo-600", sub: "text-gray-400" },
  green:  { icon: "bg-green-50 text-green-600",   text: "text-green-600",  sub: "text-gray-400" },
  purple: { icon: "bg-purple-50 text-purple-600", text: "text-purple-600", sub: "text-gray-400" },
  teal:   { icon: "bg-teal-50 text-teal-600",     text: "text-teal-600",   sub: "text-gray-400" },
  amber:  { icon: "bg-amber-50 text-amber-600",   text: "text-amber-600",  sub: "text-gray-400" },
};

function StatCard({ label, value, sub, icon: Icon, color, href }: {
  label: string; value: number; sub: string;
  icon: React.ComponentType<{ className?: string }>;
  color: ColorKey; href: string;
}) {
  const c = colorMap[color];
  return (
    <Link href={href} className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-indigo-200 hover:shadow-sm transition-all group">
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${c.icon} mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className={`text-2xl font-bold ${c.text}`}>{value.toLocaleString()}</div>
      <div className="text-sm font-medium text-gray-700 mt-0.5">{label}</div>
      <div className={`text-xs mt-0.5 ${c.sub}`}>{sub}</div>
    </Link>
  );
}

function BookingStatusRow({ label, count, color, href }: {
  label: string; count: number; color: "amber" | "green"; href: string;
}) {
  const styles = {
    amber: { bar: "bg-amber-400", badge: "bg-amber-50 text-amber-700 border-amber-200" },
    green: { bar: "bg-green-400", badge: "bg-green-50 text-green-700 border-green-200"  },
  }[color];

  return (
    <Link href={href} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
      <div className={`w-2 h-10 rounded-full shrink-0 ${styles.bar}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-700 group-hover:text-indigo-600">{label}</p>
      </div>
      <span className={`text-sm font-bold px-3 py-1 rounded-full border ${styles.badge}`}>
        {count.toLocaleString()}
      </span>
    </Link>
  );
}
