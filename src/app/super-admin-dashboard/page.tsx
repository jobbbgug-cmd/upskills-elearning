import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthUser } from "@/lib/auth";
import { withTimeout } from "@/lib/query-timeout";
import { connectDB } from "@/lib/mongodb";
import Institution from "@/models/Institution";
import User from "@/models/User";
import Course from "@/models/Course";
import Booking from "@/models/Booking";
import { Building2, Users, BookOpen, TrendingUp, CheckCircle2, Clock3, ArrowRight, Percent } from "lucide-react";
import { PLAN_LABELS } from "@/lib/planLimits";

async function getStats() {
  await connectDB();
  const [totalInstitutions, activeInstitutions, totalUsers, totalCourses, totalConfirmed, totalPending] = await Promise.all([
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
    { $lookup: { from: "institutions", localField: "institutionId", foreignField: "_id", as: "institution" } },
    { $unwind: { path: "$institution", preserveNullAndEmptyArrays: true } },
    { $group: { _id: null, total: { $sum: "$course.price" }, commission: { $sum: { $multiply: ["$course.price", { $divide: [{ $ifNull: ["$institution.commissionRate", 0] }, 100] }] } } } },
  ]);
  const totalRevenue = revPipeline[0]?.total ?? 0;
  const totalCommission = Math.round((revPipeline[0]?.commission ?? 0) * 100) / 100;

  const byPlan = await Institution.aggregate([{ $group: { _id: "$plan", count: { $sum: 1 } } }]);
  const planCounts: Record<string, number> = {};
  byPlan.forEach((p) => { planCounts[p._id] = p.count; });

  const recent = (await Institution.find().sort({ createdAt: -1 }).limit(5).select("slug name plan isActive planExpiresAt createdAt").lean()) as unknown as Array<{
    _id: { toString(): string }; slug: string; name: string; plan: string; isActive: boolean; planExpiresAt: Date | null; createdAt: Date;
  }>;

  return { totalInstitutions, activeInstitutions, totalUsers, totalCourses, totalConfirmed, totalPending, totalRevenue, totalCommission, planCounts, recent };
}

const defaultStats = { totalInstitutions: 0, activeInstitutions: 0, totalUsers: 0, totalCourses: 0, totalConfirmed: 0, totalPending: 0, totalRevenue: 0, totalCommission: 0, planCounts: {}, recent: [] };

function StatBox({ icon: Icon, label, value, sub, href, isMoney }: any) {
  const content = (
    <div className="group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <p className="text-3xl font-extrabold text-gray-900 mt-2">
            {isMoney ? `฿${value.toLocaleString()}` : value.toLocaleString()}
          </p>
          {sub && <p className="text-gray-500 text-xs mt-1">{sub}</p>}
        </div>
        <Icon className="w-8 h-8 text-gray-400 group-hover:text-gray-600 transition-colors shrink-0" />
      </div>
    </div>
  );

  return href ? (
    <Link href={href} className="bg-white rounded-2xl border border-gray-200 hover:border-gray-300 transition-all p-5 block">
      {content}
    </Link>
  ) : (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      {content}
    </div>
  );
}

export default async function SuperAdminPage() {
  const auth = await getAuthUser();
  if (!auth || auth.role !== "super_admin") redirect("/login");

  const s = await withTimeout(getStats(), 10000, defaultStats);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ภาพรวมแพลตฟอร์ม</h1>
        <p className="text-gray-500 text-sm mt-1">ยินดีต้อนรับ, {auth.name} — Super Admin</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBox icon={Building2} label="สถาบันทั้งหมด" value={s.totalInstitutions} sub={`ใช้งานอยู่ ${s.activeInstitutions}`} href="/super-admin/institutions" />
        <StatBox icon={Users} label="ผู้ใช้ทั้งหมด" value={s.totalUsers} sub="ทุกสถาบัน" href="/super-admin/institutions" />
        <StatBox icon={BookOpen} label="คอร์สทั้งหมด" value={s.totalCourses} sub="ทุกสถาบัน" href="/super-admin/institutions" />
        <StatBox icon={TrendingUp} label="รายได้รวม" value={s.totalRevenue} sub={`${s.totalConfirmed} bookings`} href="/super-admin/revenue" isMoney />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-l-4 border-gray-100 p-5" style={{ borderLeftColor: 'var(--color-primary)' }}>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
            <span className="text-gray-700 text-sm font-medium">รายได้รับแล้ว</span>
          </div>
          <div className="text-3xl font-extrabold text-gray-900">฿{s.totalRevenue.toLocaleString()}</div>
          <div className="text-gray-500 text-xs mt-1">{s.totalConfirmed} การจองยืนยันแล้ว</div>
        </div>
        <div className="bg-white rounded-2xl border border-l-4 border-gray-100 p-5" style={{ borderLeftColor: 'var(--color-primary)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Percent className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
            <span className="text-gray-700 text-sm font-medium">ค่าคอมมิชชั่นรวม</span>
          </div>
          <div className="text-3xl font-extrabold text-gray-900">฿{(() => { const r = s.totalCommission; const p = r.toString().split("."); p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ","); return p.join("."); })()}</div>
          <div className="text-gray-500 text-xs mt-1">จากรายได้ที่ยืนยันแล้ว</div>
        </div>
        <div className="bg-white rounded-2xl border border-l-4 border-gray-100 p-5" style={{ borderLeftColor: 'var(--color-primary)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Clock3 className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
            <span className="text-gray-700 text-sm font-medium">รอดำเนินการ</span>
          </div>
          <div className="text-3xl font-extrabold text-gray-900">{s.totalPending}</div>
          <div className="text-gray-500 text-xs mt-1">การจองรอตรวจสอบ</div>
        </div>
        <div className="bg-white rounded-2xl border border-l-4 border-gray-100 p-5" style={{ borderLeftColor: 'var(--color-primary)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
            <span className="text-gray-700 text-sm font-medium">สถาบันตามแผน</span>
          </div>
          <div className="space-y-1.5 mt-1">
            {Object.entries(s.planCounts).map(([plan, count]) => (
              <div key={plan} className="flex justify-between items-center">
                <span className="text-gray-600 text-xs">{PLAN_LABELS[plan as keyof typeof PLAN_LABELS]}</span>
                <span className="font-semibold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">สถาบันใหม่ล่าสุด</h2>
          <Link href="/super-admin/institutions" className="inline-flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700">
            ดูทั้งหมด <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="space-y-3">
          {s.recent.length === 0 ? (
            <p className="text-gray-500 text-sm">ยังไม่มีสถาบันในระบบ</p>
          ) : (
            s.recent.map((inst) => (
              <Link key={inst._id.toString()} href={`/admin/${inst.slug}`}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 group-hover:text-purple-600">{inst.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{new Date(inst.createdAt).toLocaleDateString("th-TH")}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${inst.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                    {inst.isActive ? "ใช้งาน" : "ปิด"}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    {PLAN_LABELS[inst.plan as keyof typeof PLAN_LABELS]}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
