import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Course from "@/models/Course";
import Booking from "@/models/Booking";
import User from "@/models/User";
import { BookOpen, Users, Calendar, TrendingUp } from "lucide-react";
import mongoose from "mongoose";

async function getStats(role: string, userId: string) {
  await connectDB();
  if (role === "admin") {
    const [totalCourses, totalBookings, totalUsers, activeCourses] = await Promise.all([
      Course.countDocuments(),
      Booking.countDocuments({ status: "confirmed" }),
      User.countDocuments({ role: "student" }),
      Course.countDocuments({ isActive: true }),
    ]);
    return { totalCourses, totalBookings, totalUsers, activeCourses };
  } else {
    const teacherCourses = await Course.find({ instructorId: userId }).select("_id");
    const courseIds = teacherCourses.map((c) => c._id as mongoose.Types.ObjectId);
    const [totalCourses, totalBookings, totalUsers, activeCourses] = await Promise.all([
      Course.countDocuments({ instructorId: userId }),
      Booking.countDocuments({ status: "confirmed", courseId: { $in: courseIds } }),
      User.countDocuments({ role: "student" }),
      Course.countDocuments({ instructorId: userId, isActive: true }),
    ]);
    return { totalCourses, totalBookings, totalUsers, activeCourses };
  }
}

export default async function AdminPage() {
  const auth = await getAuthUser();
  if (!auth || (auth.role !== "admin" && auth.role !== "teacher")) redirect("/login");

  const stats = await getStats(auth.role, auth.userId);
  const isTeacher = auth.role === "teacher";

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">ภาพรวม{isTeacher ? "คอร์สของฉัน" : "ระบบ"}</h1>
        <p className="text-gray-500 text-sm mt-1">ยินดีต้อนรับ, {auth.name}!</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {[
          { label: isTeacher ? "คอร์สของฉัน" : "คอร์สทั้งหมด", value: stats.totalCourses, icon: BookOpen, color: "text-indigo-600 bg-indigo-50" },
          { label: "คอร์สที่เปิดสอน", value: stats.activeCourses, icon: TrendingUp, color: "text-green-600 bg-green-50" },
          { label: "การจองที่อนุมัติ", value: stats.totalBookings, icon: Calendar, color: "text-purple-600 bg-purple-50" },
          { label: "นักเรียนทั้งหมด", value: stats.totalUsers, icon: Users, color: "text-orange-600 bg-orange-50" },
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
            <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600">ตรวจสอบการชำระเงิน</h3>
          </div>
          <p className="text-sm text-gray-500">ตรวจสลิปและอนุมัติการจองคอร์ส</p>
        </Link>
      </div>
    </div>
  );
}
