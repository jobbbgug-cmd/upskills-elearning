import Link from "next/link";
import Image from "next/image";
import { connectDB } from "@/lib/mongodb";
import Banner from "@/models/Banner";
import Institution from "@/models/Institution";
import BannerSlider from "@/components/BannerSlider";
import PricingSection from "@/components/PricingSection";
import TrialRequestModal from "@/components/TrialRequestModal";
import PublicPageThemeReset from "@/components/PublicPageThemeReset";
import { IBanner, GradeLevel } from "@/types";
import {
  BookOpen, Users, Video, CheckCircle, Star, Zap, Shield,
  Clock, BarChart3, CalendarCheck, GraduationCap, Building2,
  Smartphone, HeadphonesIcon, TrendingUp, AlertTriangle,
  XCircle, ArrowRight, Award, Layers, MessageSquare,
} from "lucide-react";
import { getAuthUser } from "@/lib/auth";

const GRADE_GROUPS = [
  { label: "ประถม", grades: ["ป.1", "ป.2", "ป.3", "ป.4", "ป.5", "ป.6"] as GradeLevel[], emoji: "📚" },
  { label: "มัธยมต้น", grades: ["ม.1", "ม.2", "ม.3"] as GradeLevel[], emoji: "📖" },
  { label: "มัธยมปลาย", grades: ["ม.4", "ม.5", "ม.6"] as GradeLevel[], emoji: "🎓" },
  { label: "อาชีวะ/ม.เปิด", grades: ["ปวช.", "ปวส.", "มหาวิทยาลัย", "ทั่วไป"] as GradeLevel[], emoji: "🏫" },
];

async function getData() {
  await connectDB();
  const [banners, institutions] = await Promise.all([
    Banner.find({ isActive: true }).sort({ order: 1, createdAt: 1 }).lean(),
    Institution.find({ isActive: true }).select("_id name").lean(),
  ]);
  const institutionNames: Record<string, string> = {};
  (institutions as unknown as { _id: { toString(): string }; name: string }[]).forEach((i) => {
    institutionNames[i._id.toString()] = i.name;
  });
  return {
    banners: JSON.parse(JSON.stringify(banners)) as IBanner[],
    institutionNames,
    institutionCount: institutions.length,
  };
}

export default async function HomePage() {
  const [{ banners, institutionNames, institutionCount }, user] = await Promise.all([getData(), getAuthUser()]);

  return (
    <div className="overflow-x-hidden">
      <PublicPageThemeReset />

      {/* ─── Hero / Banner ─── */}
      {banners.length > 0 ? (
        <div>
          <BannerSlider banners={banners} institutionNames={institutionNames} />
        </div>
      ) : (
        <section className="relative bg-gradient-to-br from-indigo-700 via-indigo-800 to-violet-900 text-white px-4 py-24 overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
          <div className="max-w-5xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
              แพลตฟอร์มสำหรับสถาบันสอนพิเศษ ครบวงจร
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              จัดการสถาบันสอนพิเศษ<br />
              <span className="text-yellow-400">ครบจบในที่เดียว</span>
            </h1>
            <p className="text-indigo-200 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
              ระบบจองที่นั่ง · จัดการคอร์ส · สอนสดออนไลน์ · ติดตามรายได้<br />
              ที่นั่งมีจำกัด รองรับหลายสถาบันในระบบเดียว
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/courses" className="bg-white text-indigo-700 font-semibold px-8 py-3.5 rounded-xl hover:bg-indigo-50 transition-colors shadow-lg">
                ดูคอร์สทั้งหมด
              </Link>
              {user ? (
                <Link href={user.role === "admin" || user.role === "super_admin" ? "/admin" : "/dashboard"}
                  className="bg-indigo-500 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-indigo-400 transition-colors border border-indigo-400">
                  ไปที่ Dashboard
                </Link>
              ) : (
                <Link href="/register" className="bg-indigo-500 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-indigo-400 transition-colors border border-indigo-400">
                  สมัครสมาชิกฟรี
                </Link>
              )}
              <TrialRequestModal />
            </div>
          </div>
        </section>
      )}

      {/* ─── Trial CTA ─── */}
      <section className="theme-gradient-bg px-4 md:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-white text-center sm:text-left">
          <p className="font-bold text-lg">ทดลองใช้งานระบบฟรี 30 วัน</p>
          <p className="text-white/80 text-sm">ไม่ต้องใช้บัตรเครดิต · ทีมงานติดต่อกลับภายใน 1-2 วันทำการ</p>
        </div>
        <TrialRequestModal />
      </section>

      {/* ─── Stats Bar ─── */}
      <section className="bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: Building2, label: "สถาบันที่ใช้งาน", value: `${institutionCount}+`, color: "text-violet-600" },
            { icon: Users,     label: "ที่นั่งต่อรอบ",   value: "≥ 10 คน",   color: "text-violet-600" },
            { icon: Video,     label: "สอนสดผ่าน",       value: "Jitsi Meet", color: "text-violet-600" },
            { icon: Clock,     label: "พร้อมใช้งาน",     value: "24/7",       color: "text-violet-600" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <Icon className={`w-6 h-6 ${color} mb-1`} />
              <div className="text-2xl font-bold text-gray-900">{value}</div>
              <div className="text-xs text-gray-500">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── รู้จัก UPSkills ─── */}
      <section className="py-28 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 justify-center">
              <span className="text-2xl font-bold tracking-widest text-indigo-500 uppercase">รู้จัก</span>
              <Image src="/logo.png" alt="UPSkills" width={130} height={44} className="object-contain" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-3 leading-tight">
              แพลตฟอร์มที่ออกแบบมา<br />เพื่อสถาบันสอนพิเศษโดยเฉพาะ
            </h2>
            <p className="text-gray-500 mt-5 max-w-2xl mx-auto text-base leading-relaxed">
              UPSkills ไม่ใช่แค่ระบบ LMS ทั่วไป แต่คือโซลูชั่นที่เข้าใจปัญหาจริงของสถาบันสอนพิเศษไทย
              ออกแบบมาเพื่อให้ผู้บริหาร ครู และนักเรียนทำงานร่วมกันได้อย่างราบรื่น
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10 items-center">
            {/* Left — feature list */}
            <div className="space-y-5">
              {[
                { icon: CalendarCheck, title: "ระบบจองที่นั่งแบบ Real-time", desc: "นักเรียนจองได้ทันที ที่นั่งมีจำกัดสูงสุด 10 คนต่อรอบ ลดความวุ่นวายในการจัดการ" },
                { icon: Video,         title: "สอนสดออนไลน์ด้วย Jitsi Meet", desc: "เปิดห้องเรียนได้เลยจากระบบ ไม่ต้องใช้ซอฟต์แวร์เพิ่มเติม รองรับทุกอุปกรณ์" },
                { icon: BarChart3,     title: "Dashboard ติดตามรายได้และสมาชิก", desc: "ดูสถิติการจอง รายได้รายเดือน จำนวนนักเรียนแบบ Real-time ในหน้าเดียว" },
                { icon: Layers,        title: "รองรับหลายสถาบันในระบบเดียว", desc: "ขยายธุรกิจได้โดยไม่ต้องสร้างระบบใหม่ แต่ละสถาบันมีข้อมูลแยกกันชัดเจน" },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-5 p-5 bg-white rounded-2xl border border-gray-100 hover:border-indigo-100 hover:shadow-md transition-all">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6 text-violet-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-base">{title}</p>
                    <p className="text-gray-500 text-sm mt-1 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Right — highlight card */}
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-10 translate-x-10" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-10 -translate-x-10" />
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-5">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold mb-3">ทำไมถึงเลือก UPSkills?</h3>
                <ul className="space-y-3 text-sm text-indigo-100">
                  {[
                    "ติดตั้งใช้งานได้ทันที ไม่ต้องรอ",
                    "รองรับ Multi-tenant หลายสถาบัน",
                    "ระบบ Commission & Payout อัตโนมัติ",
                    "อนุมัติสมาชิกและชำระเงินในที่เดียว",
                    "รองรับทุกอุปกรณ์ มือถือ แท็บเล็ต คอม",
                    "ทีม Support พร้อมช่วยเหลือตลอดเวลา",
                  ].map((t) => (
                    <li key={t} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                      {t}
                    </li>
                  ))}
                </ul>
                <TrialRequestModal>
                  <span className="inline-flex items-center gap-2 mt-6 bg-white text-indigo-700 font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-indigo-50 transition-colors">
                    เริ่มต้นใช้งาน <ArrowRight className="w-4 h-4" />
                  </span>
                </TrialRequestModal>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TOP 3 ปัญหา ─── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-2xl font-bold tracking-widest text-red-500 uppercase">ปัญหาที่พบบ่อย</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
              TOP 4 ปัญหาสถาบันสอนพิเศษออนไลน์<br />ที่ต้องเจอ — และ UPSkills แก้ได้
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                no: "01",
                problem: "จัดการตารางและรอบเรียนไม่ทัน",
                pain: "ต้องตอบแชทจากนักเรียนทั้งวัน รับจองผ่าน LINE ทำให้พลาดการจองซ้ำและที่นั่งเกิน",
                solution: "ระบบจองที่นั่ง Real-time จำกัดที่นั่งอัตโนมัติ แจ้งเตือนทันทีเมื่อมีการจอง",
                color: "from-red-50 to-orange-50",
                border: "border-red-100",
                badge: "bg-red-100 text-red-600",
              },
              {
                no: "02",
                problem: "ติดตามนักเรียนและรายได้ไม่ได้",
                pain: "ข้อมูลนักเรียนกระจายหลายที่ ไม่รู้ว่าใครชำระแล้ว ใครค้างชำระ รายได้เดือนนี้เท่าไหร่",
                solution: "Dashboard ครบวงจร เห็นสมาชิก รายได้ การชำระเงิน และสถิติทั้งหมดในหน้าเดียว",
                color: "from-yellow-50 to-amber-50",
                border: "border-yellow-100",
                badge: "bg-yellow-100 text-yellow-700",
              },
              {
                no: "03",
                problem: "ขยายสาขาแต่ระบบรองรับไม่ได้",
                pain: "เปิดสาขาใหม่ต้องสร้างระบบใหม่ทั้งหมด ข้อมูลกระจัดกระจาย บริหารยาก",
                solution: "รองรับ Multi-tenant แต่ละสถาบัน/สาขา มีข้อมูลแยกกัน บริหารจากศูนย์กลางได้",
                color: "from-blue-50 to-indigo-50",
                border: "border-blue-100",
                badge: "bg-blue-100 text-blue-700",
              },
              {
                no: "04",
                problem: "Meeting ได้แค่ 60 นาที ทำให้การสอนสะดุด",
                pain: "ใช้โปรแกรม Video Call ฟรีถูกตัดกลางคลาส ต้องหยุดสอนเพื่อสร้างห้องใหม่ เสียสมาธินักเรียน",
                solution: "Jitsi Meet ไม่จำกัดเวลา ไม่มีค่าใช้จ่ายเพิ่ม สอนได้ต่อเนื่องไม่มีสะดุด",
                color: "from-violet-50 to-purple-50",
                border: "border-violet-100",
                badge: "bg-violet-100 text-violet-700",
              },
            ].map(({ no, problem, pain, solution, color, border, badge }) => (
              <div key={no} className={`rounded-3xl p-6 bg-gradient-to-br ${color} border ${border}`}>
                <div className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${badge} mb-4`}>
                  ปัญหาที่ {no}
                </div>
                <div className="flex items-start gap-2 mb-3">
                  <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <p className="font-bold text-gray-900">{problem}</p>
                </div>
                <p className="text-sm text-gray-500 mb-5 leading-relaxed pl-7">{pain}</p>
                <div className="border-t border-white/60 pt-4 flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <p className="text-sm font-semibold text-gray-800 leading-relaxed">{solution}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ประเภทสถาบัน ─── */}
      <section className="py-20 px-4 bg-gradient-to-br from-slate-900 to-indigo-950 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-2xl font-bold tracking-widest text-indigo-400 uppercase">บริการของเรา</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">
              ประเภทสถาบัน<br />ที่ UPSkills ให้บริการ
            </h2>
            <p className="text-slate-400 mt-3 max-w-xl mx-auto text-sm">
              ไม่ว่าจะเป็นสถาบันขนาดเล็กหรือใหญ่ UPSkills พร้อมรองรับทุกรูปแบบการเรียนการสอน
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: "🏫", title: "สถาบันกวดวิชา", desc: "จัดการตาราง รอบเรียน ครูหลายคน" },
              { icon: "💻", title: "ติวเตอร์ออนไลน์", desc: "สอนสด Jitsi Meet บนทุกอุปกรณ์" },
              { icon: "🌐", title: "โรงเรียนสอนภาษา", desc: "คอร์สพูด อ่าน เขียน ครบวงจร" },
              { icon: "🎯", title: "คอร์สทักษะพิเศษ", desc: "ดนตรี ศิลปะ โค้ด กีฬา และอื่น ๆ" },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-colors group">
                <div className="text-4xl mb-3">{icon}</div>
                <p className="font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors">{title}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── โปรแกรม ที่ตอบโจทย์ผู้ใช้งานมากที่สุด ─── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-2xl font-bold tracking-widest text-indigo-500 uppercase">ฟีเจอร์ครบครัน</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
              โปรแกรมที่ตอบโจทย์<br />ผู้ใช้งานมากที่สุด
            </h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto text-sm">
              ออกแบบจากการฟังเสียงผู้ใช้งานจริง ฟีเจอร์ทุกอย่างมีเหตุผล ไม่มีส่วนเกิน
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: CalendarCheck, title: "ระบบจองที่นั่ง",      desc: "นักเรียนจองเอง กำหนดจำนวนที่นั่งสูงสุดต่อรอบ ปิดรับอัตโนมัติเมื่อเต็ม",    color: "bg-indigo-50 text-violet-600" },
              { icon: BookOpen,      title: "จัดการคอร์ส",          desc: "สร้างคอร์ส กำหนดราคา รอบเรียน วิชา ระดับชั้น ได้อย่างยืดหยุ่น",            color: "bg-violet-50 text-violet-600" },
              { icon: Video,         title: "สอนสดออนไลน์",         desc: "เปิดห้องเรียน Jitsi Meet ได้ทันที นักเรียนเข้าจาก Dashboard ได้เลย",          color: "bg-blue-50 text-violet-600" },
              { icon: TrendingUp,    title: "รายงานรายได้",          desc: "ดู Revenue ย้อนหลัง Commission แยกตามสถาบัน Export ได้",                       color: "bg-green-50 text-violet-600" },
              { icon: Users,         title: "จัดการสมาชิก",          desc: "อนุมัติ/ปฏิเสธคำขอ กำหนด Role ดูประวัติการจองของสมาชิกแต่ละคน",             color: "bg-orange-50 text-orange-600" },
              { icon: Shield,        title: "ระบบ Multi-tenant",    desc: "รองรับหลายสถาบันในระบบเดียว ข้อมูลแยกกันชัดเจน ปลอดภัย 100%",                 color: "bg-rose-50 text-rose-600" },
              { icon: Smartphone,    title: "รองรับทุกอุปกรณ์",     desc: "Responsive Design ใช้งานได้บน มือถือ แท็บเล็ต และคอมพิวเตอร์",                 color: "bg-teal-50 text-teal-600" },
              { icon: BarChart3,     title: "Analytics Dashboard",  desc: "กราฟสถิติ ยอดผู้ใช้ คอร์สยอดนิยม การเงินรายวัน/เดือน/ปี",                    color: "bg-cyan-50 text-cyan-600" },
              { icon: HeadphonesIcon,title: "Support ตลอดเวลา",     desc: "ทีมงานพร้อมช่วยเหลือ ตั้งค่าระบบ และแก้ไขปัญหาให้คุณ",                        color: "bg-pink-50 text-pink-600" },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="p-5 rounded-2xl border border-gray-100 hover:border-indigo-100 hover:shadow-md transition-all group bg-white">
                <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-4`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="font-bold text-gray-900 mb-1.5 group-hover:text-violet-600 transition-colors">{title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ลูกค้าที่ไว้วางใจ UPSkills ─── */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-2xl font-bold tracking-widest text-indigo-500 uppercase">ความไว้วางใจ</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
              <span className="inline-flex items-center gap-3 justify-center flex-wrap">
                ลูกค้าที่ไว้วางใจ
                <Image src="/logo.png" alt="UPSkills" width={130} height={44} className="object-contain inline-block" />
              </span>
            </h2>
            <p className="text-gray-500 mt-3 text-sm">เสียงจากสถาบันที่ใช้งานจริง</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "อ.สมชาย",
                role: "ผู้บริหารสถาบัน ABC Academy",
                review: "ก่อนใช้ UPSkills ต้องรับจอง LINE ทุกวัน วุ่นมาก ตอนนี้นักเรียนจองเองได้เลย ประหยัดเวลาไปได้เยอะมาก",
                stars: 5,
              },
              {
                name: "ครูสุดา",
                role: "ครูสอนคณิตศาสตร์ออนไลน์",
                review: "ระบบ Dashboard ดูรายได้ได้ชัดเจนมาก รู้ทันทีว่าเดือนนี้ได้เท่าไหร่ ไม่ต้องมานั่งบวกเองอีกต่อไป",
                stars: 5,
              },
              {
                name: "ผอ.วิมล",
                role: "ผู้อำนวยการ Smart Learn Center",
                review: "ขยายจาก 1 สาขาเป็น 3 สาขา ไม่ต้องสร้างระบบใหม่เลย ทีม Support ช่วยตลอด ประทับใจมาก",
                stars: 5,
              },
            ].map(({ name, role, review, stars }) => (
              <div key={name} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-5 italic">&ldquo;{review}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
                    {name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{name}</p>
                    <p className="text-xs text-gray-400">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ยึดมั่นในคุณภาพ ─── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-2xl font-bold tracking-widest text-indigo-500 uppercase">คุณภาพ</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
              ยึดมั่นในคุณภาพ<br />การให้บริการ
            </h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto text-sm">
              ทุกฟีเจอร์ผ่านการทดสอบและพัฒนาอย่างต่อเนื่อง เพื่อให้ระบบทำงานได้ดีที่สุดสำหรับคุณ
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-14">
            {[
              { icon: Award,    value: "99.9%",   label: "System Uptime",      color: "text-violet-600",  bg: "bg-green-50" },
              { icon: Zap,      value: "< 1 วิ",  label: "ความเร็วโหลดหน้า",  color: "text-yellow-600", bg: "bg-yellow-50" },
              { icon: Shield,   value: "256-bit", label: "การเข้ารหัสข้อมูล", color: "text-violet-600",   bg: "bg-blue-50" },
              { icon: MessageSquare, value: "24/7", label: "Support ออนไลน์", color: "text-violet-600", bg: "bg-violet-50" },
            ].map(({ icon: Icon, value, label, color, bg }) => (
              <div key={label} className={`${bg} rounded-2xl p-6 text-center border border-transparent`}>
                <Icon className={`w-8 h-8 ${color} mx-auto mb-3`} />
                <div className={`text-3xl font-black ${color}`}>{value}</div>
                <div className="text-sm text-gray-600 mt-1 font-medium">{label}</div>
              </div>
            ))}
          </div>

          {/* Quality checklist */}
          <div className="bg-gradient-to-r from-indigo-50 to-violet-50 rounded-3xl p-8 grid md:grid-cols-2 gap-4">
            {[
              "ระบบทำงานเสถียร ไม่หยุดชะงักในชั่วโมงเรียน",
              "อัปเดตฟีเจอร์ใหม่อย่างต่อเนื่องตามความต้องการ",
              "ข้อมูลสำรองอัตโนมัติทุกวัน ไม่มีสูญหาย",
              "ทีมงานเทคนิคพร้อมแก้ไขปัญหาภายใน 24 ชั่วโมง",
              "UI/UX เรียบง่าย ผู้สูงอายุก็ใช้งานได้",
              "รองรับนักเรียนและครูได้ไม่จำกัดจำนวน",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-indigo-500 shrink-0" />
                <span className="text-sm text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── เพราะธุรกิจเป็นเรื่องจริงจัง ─── */}
      <section className="py-20 px-4 bg-gradient-to-br from-indigo-700 via-indigo-800 to-violet-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <AlertTriangle className="w-10 h-10 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
            เพราะธุรกิจเป็นเรื่องจริงจัง<br />
            <span className="text-yellow-400">ระบบที่ใช้ต้องเสถียร รวดเร็ว<br />และพัฒนาต่อเนื่อง</span>
          </h2>
          <p className="text-indigo-200 text-lg mb-10 max-w-2xl mx-auto">
            UPSkills ไม่ใช่แค่ซอฟต์แวร์ แต่คือพาร์ตเนอร์ที่เติบโตไปพร้อมกับสถาบันของคุณ
            เราพัฒนาระบบอย่างต่อเนื่องโดยฟังเสียงผู้ใช้งานจริงเป็นหลัก
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <TrialRequestModal>
              <span className="text-white font-bold px-8 py-4 rounded-xl transition-colors shadow-lg text-base inline-block" style={{ backgroundColor: 'var(--color-primary)' }}>
                เริ่มต้นใช้งานฟรี →
              </span>
            </TrialRequestModal>
            <Link href="/courses" className="bg-white/10 border border-white/20 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/20 transition-colors text-base">
              ดูคอร์สทั้งหมด
            </Link>
          </div>
        </div>
      </section>

      {/* ─── เลือกระดับชั้น ─── */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">เลือกระดับชั้นที่เรียน</h2>
          <p className="text-gray-500 text-sm text-center mb-8">เราจัดคอร์สให้ครบทุกระดับ ตั้งแต่ประถมจนถึงมหาวิทยาลัย</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {GRADE_GROUPS.map((group) => (
              <Link
                key={group.label}
                href={`/courses?gradeGroup=${encodeURIComponent(group.label)}`}
                className="bg-white rounded-2xl p-5 text-center border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all group"
              >
                <div className="text-3xl mb-2">{group.emoji}</div>
                <div className="text-base font-bold text-gray-800 group-hover:text-violet-600 transition-colors">{group.label}</div>
                <div className="text-xs text-gray-400 mt-1">{group.grades.join(" · ")}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <PricingSection />

    </div>
  );
}
