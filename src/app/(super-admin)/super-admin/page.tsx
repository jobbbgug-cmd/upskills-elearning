import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Institution from "@/models/Institution";
import User from "@/models/User";
import Course from "@/models/Course";
import Booking from "@/models/Booking";
import { Building2, Users, BookOpen, TrendingUp, CheckCircle2, Clock3, ArrowRight } from "lucide-react";
import { PLAN_LABELS } from "@/lib/planLimits";

async function getStats() {
  await connectDB();
  const [
    totalInstitutions,
    activeInstitutions,
    totalUsers,
    totalCourses,
    totalConfirmed,
    totalPending,
  ] = await Promise.all([
    Institution.countDocuments(),
    Institution.countDocuments({ isActive: true }),
    User.countDocuments({ role: { $ne: "super_admin" } }),
    Course.countDocuments(),
    Booking.countDocuments({ status: "confirmed" }),
    Booking.countDocuments({ status: "pending_payment" }),
  ]);

  const revPipeline = await Booking.aggregate([
    { $match: { status: "confirmed" } },
    { $lookup: { from: "courses", localField: "courseId", foreignField: "_id", as: "course" } },
    { $unwind: "$course" },
    { $group: { _id: null, total: { $sum: "$course.price" } } },
  ]);
  const totalRevenue = revPipeline[0]?.total ?? 0;

  const byPlan = await Institution.aggregate([{ $group: { _id: "$plan", count: { $sum: 1 } } }]);
  const planCounts: Record<string, number> = {};
  byPlan.forEach((p) => { planCounts[p._id] = p.count; });

  const recent = (await Institution.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select("slug name plan isActive planExpiresAt createdAt")
    .lean()) as unknown as Array<{
      _id: { toString(): string };
      slug: string;
      name: string;
      plan: string;
      isActive: boolean;
      planExpiresAt: Date | null;
      createdAt: Date;
    }>;

  return { totalInstitutions, activeInstitutions, totalUsers, totalCourses, totalConfirmed, totalPending, totalRevenue, planCounts, recent };
}

export default async function SuperAdminPage() {
  const auth = await getAuthUser();
  if (!auth || auth.role !== "super_admin") redirect("/login");

  const s = await getStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ภาพรวมแพลตฟอร์ม</h1>
        <p className="text-gray-500 text-sm mt-1">ยินดีต้อนรับ, {auth.name} — Super Admin</p>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBox icon={Building2} label="สถาบันทั้งหมด" value={s.totalInstitutions} sub={`ใช้งานอยู่ ${s.activeInstitutions}`} color="violet" href="/super-admin/institutions" />
        <StatBox icon={Users} label="ผู้ใช้ทั้งหมด" value={s.totalUsers} sub="ทุกสถาบัน" color="blue" href="/super-admin/institutions" />
        <StatBox icon={BookOpen} label="คอร์สทั้งหมด" value={s.totalCourses} sub="ทุกสถาบัน" color="indigo" href="/super-admin/institutions" />
        <StatBox icon={TrendingUp} label="รายได้รวม" value={s.totalRevenue} sub={`${s.totalConfirmed} bookings`} color="green" href="/super-admin/institutions" isMoney />
      </div>

      {/* Revenue/booking split */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-green-200" />
            <span className="text-green-100 text-sm font-medium">รายได้รับแล้ว</span>
          </div>
          <div className="text-3xl font-extrabold">฿{s.totalRevenue.toLocaleString()}</div>
          <div className="text-green-100 text-xs mt-1">{s.totalConfirmed} การจองยืนยันแล้ว</div>
        </div>
        <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-3">
            <Clock3 className="w-5 h-5 text-amber-200" />
            <span className="text-amber-100 text-sm font-medium">รอดำเนินการ</span>
          </div>
          <div className="text-3xl font-extrabold">{s.totalPending}</div>
          <div className="text-amber-100 text-xs mt-1">การจองรอตรวจสอบ</div>
        </div>
        <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="w-5 h-5 text-violet-200" />
            <span className="text-violet-100 text-sm font-medium">สถาบันตามแผน</span>
          </div>
          <div className="space-y-1 mt-1">
            {Object.entries(s.planCounts).map(([plan, count]) => (
              <div key={plan} className="flex justify-between text-sm">
                <span className="text-violet-200">{PLAN_LABELS[plan] ?? plan}</span>
                <span className="text-white font-bold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent institutions */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">สถาบันล่าสุด</h2>
          <Link href="/super-admin/institutions" className="text-sm text-violet-600 hover:underline flex items-center gap-1">
            ดูทั้งหมด <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="space-y-2">
          {s.recent.map((inst) => {
            const expired = inst.planExpiresAt && inst.planExpiresAt < new Date();
            return (
              <div key={inst._id.toString()} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{inst.name}</p>
                  <p className="text-xs text-gray-400">{inst.slug}</p>
                </div>
                <div className="flex items-center gap-2">
                  <PlanBadge plan={inst.plan} />
                  {!inst.isActive && (
                    <span className="text-xs bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full">ระงับ</span>
                  )}
                  {expired && (
                    <span className="text-xs bg-orange-50 text-orange-600 border border-orange-200 px-2 py-0.5 rounded-full">หมดอายุ</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatBox({ icon: Icon, label, value, sub, color, href, isMoney = false }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; value: number; sub: string; color: string; href: string; isMoney?: boolean;
}) {
  const colors: Record<string, string> = {
    violet: "bg-violet-50 text-violet-600",
    blue:   "bg-blue-50 text-blue-600",
    indigo: "bg-indigo-50 text-indigo-600",
    green:  "bg-green-50 text-green-600",
  };
  return (
    <Link href={href} className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-violet-200 hover:shadow-sm transition-all group">
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3 ${colors[color] ?? colors.violet}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-2xl font-bold text-gray-900">
        {isMoney ? `฿${value.toLocaleString()}` : value.toLocaleString()}
      </div>
      <div className="text-sm font-medium text-gray-700 mt-0.5">{label}</div>
      <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
    </Link>
  );
}

function PlanBadge({ plan }: { plan: string }) {
  const styles: Record<string, string> = {
    trial:      "bg-gray-50 text-gray-600 border-gray-200",
    starter:    "bg-blue-50 text-blue-600 border-blue-200",
    pro:        "bg-violet-50 text-violet-600 border-violet-200",
    enterprise: "bg-amber-50 text-amber-700 border-amber-200",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${styles[plan] ?? styles.trial}`}>
      {PLAN_LABELS[plan] ?? plan}
    </span>
  );
}
