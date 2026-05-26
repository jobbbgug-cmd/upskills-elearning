import Link from "next/link";
import { connectDB } from "@/lib/mongodb";
import Course from "@/models/Course";
import Banner from "@/models/Banner";
import CourseCard from "@/components/CourseCard";
import BannerSlider from "@/components/BannerSlider";
import { ICourse, IBanner, GradeLevel } from "@/types";
import { BookOpen, Users, Video } from "lucide-react";
import { getAuthUser } from "@/lib/auth";

const GRADE_GROUPS = [
  { label: "ประถม", grades: ["ป.1", "ป.2", "ป.3", "ป.4", "ป.5", "ป.6"] as GradeLevel[] },
  { label: "มัธยมต้น", grades: ["ม.1", "ม.2", "ม.3"] as GradeLevel[] },
  { label: "มัธยมปลาย", grades: ["ม.4", "ม.5", "ม.6"] as GradeLevel[] },
  { label: "อาชีวะ/ม.เปิด", grades: ["ปวช.", "ปวส.", "มหาวิทยาลัย", "ทั่วไป"] as GradeLevel[] },
];

async function getData() {
  await connectDB();
  const [courses, banners] = await Promise.all([
    Course.find({ isActive: true }).sort({ createdAt: -1 }).limit(6).lean(),
    Banner.find({ isActive: true }).sort({ order: 1, createdAt: 1 }).lean(),
  ]);
  return {
    courses: JSON.parse(JSON.stringify(courses)) as ICourse[],
    banners: JSON.parse(JSON.stringify(banners)) as IBanner[],
  };
}

export default async function HomePage() {
  const [{ courses, banners }, user] = await Promise.all([getData(), getAuthUser()]);

  return (
    <div>
      {/* Banner Slider */}
      {banners.length > 0 ? (
        <BannerSlider banners={banners} />
      ) : (
        /* Fallback hero when no banners */
        <section className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white py-20 px-4">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              จองที่นั่งเรียน<br />
              <span className="text-yellow-400">ง่ายเหมือนจองตั๋วหนัง</span>
            </h1>
            <p className="text-indigo-200 text-lg mb-10 max-w-2xl mx-auto">
              เลือกระดับชั้น เลือกคอร์ส เลือกรอบเวลา จองได้เลย! ที่นั่งมีจำกัดเพื่อให้ได้รับความใส่ใจสูงสุด
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/courses" className="bg-white text-indigo-700 font-semibold px-8 py-3.5 rounded-xl hover:bg-indigo-50 transition-colors">
                ดูคอร์สทั้งหมด
              </Link>
              {user ? (
                <Link href={user.role === "admin" ? "/admin" : "/dashboard"} className="bg-indigo-500 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-indigo-400 transition-colors border border-indigo-400">
                  ไปที่ Dashboard
                </Link>
              ) : (
                <Link href="/register" className="bg-indigo-500 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-indigo-400 transition-colors border border-indigo-400">
                  สมัครสมาชิกฟรี
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Stats */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-3 gap-8 text-center">
          {[
            { icon: BookOpen, label: "คอร์สทั้งหมด", value: courses.length + "+" },
            { icon: Users, label: "ที่นั่งต่อรอบ", value: "10 คน" },
            { icon: Video, label: "สอนสดผ่าน", value: "Jitsi Meet" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label}>
              <Icon className="w-7 h-7 text-indigo-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{value}</div>
              <div className="text-sm text-gray-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Grade Level Filter */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">เลือกระดับชั้นที่เรียน</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {GRADE_GROUPS.map((group) => (
            <Link
              key={group.label}
              href={`/courses?gradeGroup=${encodeURIComponent(group.label)}`}
              className="bg-white rounded-2xl p-5 text-center border border-gray-100 hover:border-indigo-200 hover:shadow-sm transition-all group"
            >
              <div className="text-lg font-semibold text-gray-800 group-hover:text-indigo-600">{group.label}</div>
              <div className="text-sm text-gray-400 mt-1">{group.grades.join(" · ")}</div>
            </Link>
          ))}
        </div>

        {/* Latest Courses */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">คอร์สล่าสุด</h2>
          <Link href="/courses" className="text-indigo-600 text-sm font-medium hover:underline">
            ดูทั้งหมด →
          </Link>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>ยังไม่มีคอร์ส</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
