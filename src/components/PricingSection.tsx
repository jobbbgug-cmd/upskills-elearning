"use client";
import { useState } from "react";
import {
  Check, Zap, BookOpen, Users, Building2, Percent,
  BarChart3, Palette, Shield, Star,
} from "lucide-react";
import PurchaseModal from "@/components/PurchaseModal";

const PLANS = [
  {
    id: "trial",
    name: "Trial",
    color: "gray",
    monthlyPrice: 0,
    yearlyPrice: 0,
    isFree: true,
    description: "ทดลองใช้ฟรี 30 วัน",
    maxCourses: 1,
    maxStudents: 10,
    maxBranches: 1,
    commission: 12,
    cta: "ทดลองใช้ฟรี",
    ctaHref: "/register",
    ctaStyle: "outline",
    features: [
      "คอร์สสูงสุด 1 คอร์ส",
      "นักเรียนสูงสุด 10 คน",
      "1 สาขา",
      "ระบบจองที่นั่ง",
      "สแกน QR Code",
      "Dashboard พื้นฐาน",
    ],
    target: "เหมาะสำหรับสถาบันเปิดใหม่",
  },
  {
    id: "starter",
    name: "Starter",
    color: "violet",
    monthlyPrice: 690,
    yearlyPrice: 6900,
    isFree: false,
    description: "สถาบันเริ่มต้น",
    maxCourses: 3,
    maxStudents: 50,
    maxBranches: 1,
    commission: 10,
    cta: "สั่งซื้อเลย!",
    ctaHref: "/register",
    ctaStyle: "violet",
    features: [
      "คอร์สสูงสุด 3 คอร์ส",
      "นักเรียนสูงสุด 50 คน",
      "1 สาขา",
      "ทุกฟีเจอร์ Trial",
      "ระบบจัดการเนื้อหา",
      "รายงานพื้นฐาน",
    ],
    target: "สถาบันขนาดเล็กเริ่มต้น",
  },
  {
    id: "growth",
    name: "Growth",
    color: "teal",
    monthlyPrice: 990,
    yearlyPrice: 9900,
    isFree: false,
    description: "โรงเรียนกวดวิชาขนาดกลาง",
    maxCourses: 10,
    maxStudents: 200,
    maxBranches: 3,
    commission: 8,
    cta: "สั่งซื้อเลย!",
    ctaHref: "/register",
    ctaStyle: "teal",
    features: [
      "คอร์สสูงสุด 10 คอร์ส",
      "นักเรียนสูงสุด 200 คน",
      "สูงสุด 3 สาขา",
      "ทุกฟีเจอร์ Starter",
      "ระบบจัดการเนื้อหา",
      "รายงานมากกว่า 10 รายการ",
    ],
    target: "โรงเรียนกวดวิชาขนาดกลาง",
  },
  {
    id: "pro",
    name: "Pro",
    color: "indigo",
    monthlyPrice: 2490,
    yearlyPrice: 24900,
    isFree: false,
    popular: true,
    description: "สถาบันที่กำลังเติบโต",
    maxCourses: 50,
    maxStudents: 1000,
    maxBranches: 10,
    commission: 5,
    cta: "สั่งซื้อเลย!",
    ctaHref: "/register",
    ctaStyle: "indigo",
    features: [
      "คอร์สสูงสุด 50 คอร์ส",
      "นักเรียนสูงสุด 1,000 คน",
      "สูงสุด 10 สาขา",
      "ทุกฟีเจอร์ Growth",
      "Custom Branding / โลโก้",
      "White-Label Mode",
    ],
    target: "สถาบันที่กำลังเติบโต",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    color: "sky",
    monthlyPrice: null,
    yearlyPrice: null,
    isFree: false,
    description: "เชน / แฟรนไชส์ขนาดใหญ่",
    maxCourses: 0,
    maxStudents: 0,
    maxBranches: 0,
    commission: 3,
    cta: "ติดต่อทีมงาน",
    ctaHref: "/register",
    ctaStyle: "sky",
    features: [
      "คอร์ส ไม่จำกัด",
      "นักเรียน ไม่จำกัด",
      "สาขา ไม่จำกัด",
      "ทุกฟีเจอร์ Pro",
      "Custom Domain",
      "SLA & Priority Support",
    ],
    target: "เชน / แฟรนไชส์",
  },
];

const FEATURE_GROUPS = [
  {
    icon: BookOpen,
    title: "การจัดการคอร์ส",
    color: "indigo",
    items: [
      "สร้างและจัดการคอร์สออนไลน์",
      "ระบบจองที่นั่งแบบ Cinema",
      "จัดตารางเรียน / ตารางสอน",
      "แนบคลิปวิดีโอ / YouTube",
      "ไฟล์ PDF / Ebook",
      "Smart PPT / สื่อการสอน",
    ],
  },
  {
    icon: Zap,
    title: "การขายและชำระเงิน",
    color: "violet",
    items: [
      "ระบบสแกน QR Code",
      "แนบสลิปอัตโนมัติ",
      "อนุมัติการชำระ (Admin)",
      "ติดตามรายได้รายคอร์ส",
      "ตั้งค่าบัญชีธนาคาร",
      "รายงานรายได้",
    ],
  },
  {
    icon: Users,
    title: "การจัดการผู้ใช้",
    color: "emerald",
    items: [
      "สมัครสมาชิก / อนุมัติ",
      "บทบาท: นักเรียน / ครู / แอดมิน",
      "ตารางเรียนส่วนตัว",
      "แจ้งเตือนสถานะการจอง",
      "จัดการหลายสาขา",
      "ระบบล็อกอิน JWT",
    ],
  },
  {
    icon: Palette,
    title: "Branding & ระบบ",
    color: "pink",
    items: [
      "อัปโหลดโลโก้ / Favicon",
      "เลือกสีหลักของแพลตฟอร์ม",
      "White-Label (ซ่อน UPSkills)",
      "Subdomain & Custom Domain",
      "จัดการแบนเนอร์",
      "ตั้งค่าข้อมูลทางการเงิน",
    ],
  },
  {
    icon: BarChart3,
    title: "Dashboard & รายงาน",
    color: "amber",
    items: [
      "ภาพรวมรายได้ / จำนวนจอง",
      "กราฟรายได้รายเดือน",
      "คอร์สยอดนิยม",
      "สมาชิกใหม่รายวัน",
      "Commission & Payout",
      "ตรวจสอบการชำระเงิน",
    ],
  },
  {
    icon: Shield,
    title: "Super Admin",
    color: "rose",
    items: [
      "จัดการสถาบันทั้งหมด",
      "ตั้งค่าแพ็คเกจ / วันหมดอายุ",
      "ดู Commission รายสถาบัน",
      "บันทึก Payout รายเดือน",
      "สถิติรวมทั้งแพลตฟอร์ม",
      "ระงับ / เปิดใช้งานสถาบัน",
    ],
  },
];

const COLOR_MAP: Record<string, {
  border: string; badge: string; check: string;
  btn: string; bg: string; accent: string; icon: string;
}> = {
  gray:   { border: "border-gray-200",   badge: "",                                                  check: "text-gray-400",  btn: "bg-gray-100 text-gray-700 hover:bg-gray-200",                        bg: "bg-white",              accent: "text-gray-600", icon: "bg-gray-100 text-gray-500" },
  violet: { border: "border-violet-300", badge: "bg-violet-600",                                     check: "text-violet-500", btn: "bg-violet-600 text-white hover:bg-violet-700",                      bg: "bg-white",              accent: "text-violet-600", icon: "bg-violet-100 text-violet-600" },
  teal:   { border: "border-teal-300",   badge: "bg-teal-600",                                       check: "text-teal-500",  btn: "bg-teal-600 text-white hover:bg-teal-700",                           bg: "bg-white",              accent: "text-teal-600", icon: "bg-teal-100 text-teal-600" },
  indigo: { border: "border-indigo-400", badge: "bg-gradient-to-r from-violet-600 to-indigo-600",   check: "text-indigo-500", btn: "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-200", bg: "bg-gradient-to-b from-indigo-50 to-white", accent: "text-indigo-600", icon: "bg-indigo-100 text-indigo-600" },
  sky:    { border: "border-sky-300",    badge: "bg-sky-500",                                        check: "text-sky-500",   btn: "bg-sky-500 text-white hover:bg-sky-600",                             bg: "bg-white",              accent: "text-sky-600", icon: "bg-sky-100 text-sky-600" },
  emerald:{ border: "", badge: "", check: "text-emerald-500", btn: "", bg: "", accent: "text-emerald-600", icon: "bg-emerald-100 text-emerald-600" },
  pink:   { border: "", badge: "", check: "text-pink-500",    btn: "", bg: "", accent: "text-pink-600",    icon: "bg-pink-100 text-pink-600" },
  amber:  { border: "", badge: "", check: "text-amber-500",   btn: "", bg: "", accent: "text-amber-600",   icon: "bg-amber-100 text-amber-600" },
  rose:   { border: "", badge: "", check: "text-rose-500",    btn: "", bg: "", accent: "text-rose-600",    icon: "bg-rose-100 text-rose-600" },
};

function fmt(n: number) {
  return n.toLocaleString("th-TH");
}

type PlanEntry = typeof PLANS[number];

export default function PricingSection() {
  const [yearly, setYearly] = useState(false);
  const [modalPlan, setModalPlan] = useState<PlanEntry | null>(null);

  return (
    <>
    <section id="section-pricing" className="bg-gray-50 py-20 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Heading */}
        <div className="text-center mb-12">
          <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-bold px-4 py-1.5 rounded-full mb-4 uppercase tracking-wider">
            Pricing
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
            เลือกแผนที่เหมาะกับ<span className="text-indigo-600">สถาบันของคุณ</span>
          </h2>
          <p className="text-gray-500 text-base max-w-xl mx-auto">
            ทุกแพ็คเกจรองรับฟังก์ชันบริหารคอร์สครบวงจร · ไม่มีค่าใช้จ่ายแอบแฝง
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-3 mt-7 bg-white border border-gray-200 rounded-2xl p-1.5 shadow-sm">
            <button
              onClick={() => setYearly(false)}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                !yearly ? "bg-indigo-600 text-white shadow" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              รายเดือน
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                yearly ? "bg-indigo-600 text-white shadow" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              รายปี
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                yearly ? "bg-white/20 text-white" : "bg-green-100 text-green-700"
              }`}>
                ประหยัด 17%
              </span>
            </button>
          </div>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {PLANS.map((plan) => {
            const c = COLOR_MAP[plan.color];
            const price = yearly ? plan.yearlyPrice : plan.monthlyPrice;
            const origPrice = plan.monthlyPrice ? plan.monthlyPrice * 12 : null;

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-2xl border-2 p-6 transition-shadow hover:shadow-xl ${c.border} ${c.bg}`}
              >
                {plan.popular && (
                  <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 ${c.badge} text-white text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1 whitespace-nowrap`}>
                    <Star className="w-3 h-3 fill-white" /> แนะนำ
                  </div>
                )}

                <div className={`text-sm font-bold mb-1 ${c.accent}`}>{plan.name}</div>

                {/* Price */}
                <div className="mb-1">
                  {plan.isFree ? (
                    <div className="text-4xl font-extrabold text-gray-900">ฟรี</div>
                  ) : plan.monthlyPrice === null ? (
                    <div className="text-2xl font-extrabold text-gray-900 leading-tight pt-1">ติดต่อ<br/><span className="text-sm font-normal text-gray-400">ราคาพิเศษ</span></div>
                  ) : (
                    <div>
                      <div className="flex items-end gap-1">
                        <span className="text-4xl font-extrabold text-gray-900">{fmt(price!)}</span>
                        <span className="text-sm text-gray-400 mb-1.5">บาท/{yearly ? "ปี" : "เดือน"}</span>
                      </div>
                      {yearly && origPrice && (
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-400 line-through">{fmt(origPrice)} บาท</span>
                          <span className="text-xs font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">-17%</span>
                        </div>
                      )}
                      {!yearly && (
                        <div className="text-xs text-gray-400 mt-0.5">หรือ {fmt(plan.yearlyPrice!)} บาท/ปี</div>
                      )}
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-400 mb-4">{plan.description}</p>

                {/* Key limits */}
                <div className="grid grid-cols-3 gap-1.5 mb-4">
                  {[
                    { icon: BookOpen, val: plan.maxCourses === 0 ? "∞" : plan.maxCourses, label: "คอร์ส" },
                    { icon: Users,    val: plan.maxStudents === 0 ? "∞" : plan.maxStudents, label: "นักเรียน" },
                    { icon: Building2,val: plan.maxBranches === 0 ? "∞" : plan.maxBranches, label: "สาขา" },
                  ].map(({ icon: Icon, val, label }) => (
                    <div key={label} className="bg-white/70 rounded-xl p-2 text-center border border-gray-100">
                      <Icon className={`w-3.5 h-3.5 mx-auto mb-0.5 ${c.accent}`} />
                      <div className="text-sm font-bold text-gray-800">{val}</div>
                      <div className="text-[10px] text-gray-400">{label}</div>
                    </div>
                  ))}
                </div>

                {/* Commission */}
                <div className="flex items-center gap-1.5 mb-4 text-xs">
                  <Percent className={`w-3.5 h-3.5 ${c.accent}`} />
                  <span className="text-gray-500">Commission:</span>
                  <span className={`font-bold ${c.accent}`}>{plan.commission}%</span>
                  <span className="text-gray-400">ต่อการจอง</span>
                </div>

                <hr className="border-gray-100 mb-4" />

                {/* Features */}
                <ul className="flex-1 space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-gray-600">
                      <Check className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${c.check}`} />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  onClick={() => setModalPlan(plan)}
                  className={`w-full text-center py-2.5 rounded-xl text-sm font-bold transition-all ${c.btn}`}
                >
                  {plan.cta}
                </button>
              </div>
            );
          })}
        </div>

        {/* Target row */}
        <div className="grid grid-cols-5 gap-4 text-center mb-16">
          {PLANS.map((plan) => (
            <p key={plan.id} className="text-xs text-gray-400">{plan.target}</p>
          ))}
        </div>

        {/* Tagline banner */}
        <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-sky-500 rounded-2xl p-5 text-center text-white mb-14 shadow-lg shadow-indigo-200">
          <span className="text-yellow-300 font-extrabold">"ทุกแพ็คเกจ"</span>
          <span className="font-semibold"> รองรับฟังก์ชันบริหารคอร์สครบวงจร</span>
        </div>

        {/* Feature groups */}
        <div className="mb-8 text-center">
          <h3 className="text-2xl font-extrabold text-gray-900 mb-1">ฟีเจอร์ครบครัน ทุกแพ็คเกจ</h3>
          <p className="text-gray-400 text-sm">ออกแบบมาเพื่อการบริหารสถาบันการศึกษาโดยเฉพาะ</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {FEATURE_GROUPS.map((group) => {
            const c = COLOR_MAP[group.color];
            const Icon = group.icon;
            return (
              <div key={group.title} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${c.icon}`}>
                    <Icon className="w-4.5 h-4.5 w-[18px] h-[18px]" />
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm">{group.title}</h4>
                </div>
                <ul className="space-y-2">
                  {group.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-xs text-gray-600 border-b border-dashed border-gray-100 pb-2 last:border-0 last:pb-0">
                      <Check className={`w-3.5 h-3.5 shrink-0 ${c.check}`} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Commission note */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
            <Percent className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="font-bold text-amber-900 text-sm mb-1">หมายเหตุ Commission</p>
            <p className="text-amber-800 text-xs leading-relaxed">
              ระบบจะหัก Commission อัตโนมัติจากยอดการจองที่ได้รับการยืนยัน —{" "}
              <strong>Trial 12%</strong> · <strong>Starter 10%</strong> · <strong>Growth 8%</strong> · <strong>Pro 5%</strong> · <strong>Enterprise 3%</strong>
              <br />ยิ่งอัปเกรดแผน ยิ่งเสีย Commission น้อยลง ช่วยให้ธุรกิจคุ้มค่ายิ่งขึ้นในระยะยาว
            </p>
          </div>
        </div>

      </div>
    </section>

    {/* Purchase / Contact modal */}
    {modalPlan && (
      <PurchaseModal
        plan={modalPlan}
        yearly={yearly}
        onClose={() => setModalPlan(null)}
      />
    )}
  </>
  );
}
