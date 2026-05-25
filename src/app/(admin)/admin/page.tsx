import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Course from "@/models/Course";
import Booking from "@/models/Booking";
import User from "@/models/User";
import { BookOpen, Users, Calendar, TrendingUp } from "lucide-react";

async function getStats() {
  await connectDB();
  const [totalCourses, totalBookings, totalUsers, activeCourses] = await Promise.all([
    Course.countDocuments(),
    Booking.countDocuments({ status: "confirmed" }),
    User.countDocuments({ role: "student" }),
    Course.countDocuments({ isActive: true }),
  ]);
  return { totalCourses, totalBookings, totalUsers, activeCourses };
}

export default async function AdminPage() {
  const auth = await getAuthUser();
  if (!auth || auth.role !== "admin") redirect("/login");

  const stats = await getStats();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">ภาพรวมระบบ</h1>
        <p className="text-gray-500 text-sm mt-1">ยินดีต้อนรับ Admin!</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {[
          { label: "คอร์สทั้งหมด", value: stats.totalCourses, icon: BookOpen, color: "text-indigo-600 bg-indigo-50" },
          { label: "คอร์สที่เปิดสอน", value: stats.activeCourses, icon: TrendingUp, color: "text-green-600 bg-green-50" },
          { label: "การจองทั้งหมด", value: stats.totalBookings, icon: Calendar, color: "text-purple-600 bg-purple-50" },
          { label: "นักเรียน", value: stats.totalUsers, icon: Users, color: "text-orange-600 bg-orange-50" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${color} mb-3`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Link href="/admin/courses" className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-indigo-200 hover:shadow-sm transition-all group">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-5 h-5 text-indigo-500" />
            <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600">จัดการคอร์ส</h3>
          </div>
          <p className="text-sm text-gray-500">เพิ่ม แก้ไข ลบคอร์ส อัปโหลดรูปปก กำหนดรอบเรียน</p>
        </Link>
        <Link href="/admin/bookings" className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-indigo-200 hover:shadow-sm transition-all group">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-purple-500" />
            <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600">ดูการจองทั้งหมด</h3>
          </div>
          <p className="text-sm text-gray-500">ดูรายชื่อนักเรียนที่จองคอร์สต่างๆ</p>
        </Link>
      </div>
    </div>
  );
}
