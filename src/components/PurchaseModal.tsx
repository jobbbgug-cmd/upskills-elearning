"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import {
  X, CheckCircle, BookOpen, Users, Building2,
  Percent, Check, ChevronDown,
} from "lucide-react";

const CONTACT_CHANNELS = [
  { value: "LINE",      label: "LINE",      logo: "/logos/LINE.png",      placeholder: "LINE ID หรือเบอร์โทร" },
  { value: "Facebook",  label: "Facebook",  logo: "/logos/Facebook.png",  placeholder: "ชื่อ Facebook หรือ URL" },
  { value: "Instagram", label: "Instagram", logo: "/logos/Instagram.png", placeholder: "Instagram @username" },
  { value: "WhatsApp",  label: "WhatsApp",  logo: "/logos/WhatsApp.png",  placeholder: "เบอร์ WhatsApp" },
  { value: "Email",     label: "Email",     logo: "/logos/Email.png",     placeholder: "อีเมลสำรอง" },
  { value: "SMS",       label: "SMS",       logo: "/logos/sms.png",       placeholder: "เบอร์โทรศัพท์" },
];

interface Plan {
  id: string;
  name: string;
  monthlyPrice: number | null;
  yearlyPrice: number | null;
  maxCourses: number;
  maxStudents: number;
  maxBranches: number;
  commission: number;
  color: string;
}

interface Props {
  plan: Plan | null;
  yearly: boolean;
  onClose: () => void;
}

const ACCENT: Record<string, string> = {
  gray:   "from-gray-500 to-gray-600",
  violet: "from-violet-600 to-violet-700",
  indigo: "from-violet-600 to-indigo-600",
  sky:    "from-sky-500 to-cyan-600",
};

function fmt(n: number) { return n.toLocaleString("th-TH"); }

export default function PurchaseModal({ plan, yearly, onClose }: Props) {
  const [form, setForm] = useState({
    institutionName: "",
    name: "",
    phone: "",
    email: "",
    contactChannel: "LINE",
    contactId: "",
  });
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState(false);

  // lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  if (!plan) return null;

  const price = yearly ? plan.yearlyPrice : plan.monthlyPrice;
  const gradientCls = ACCENT[plan.color] ?? ACCENT.indigo;
  const selectedChannel = CONTACT_CHANNELS.find((c) => c.value === form.contactChannel);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.contactChannel) { setError("กรุณาเลือกช่องทางการติดต่อ"); return; }
    if (!form.contactId.trim()) { setError("กรุณาระบุรายละเอียดช่องทางการติดต่อ"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${form.name}${form.institutionName ? ` (${form.institutionName})` : ""}`,
          email: form.email,
          role: "student",
          contactChannel: form.contactChannel,
          contactId: form.phone
            ? `Tel: ${form.phone} | ${form.contactChannel}: ${form.contactId} | แผน: ${plan.name}`
            : `${form.contactId} | แผน: ${plan.name}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "เกิดข้อผิดพลาด");
      else setSuccess(true);
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">

        {/* ─── Left panel ─── */}
        <div className={`hidden md:flex flex-col justify-between bg-gradient-to-br ${gradientCls} p-8 w-72 shrink-0 text-white`}>
          {/* Logo */}
          <div>
            <Image src="/logo.png" alt="UPSkills" width={130} height={45} className="object-contain brightness-0 invert mb-8" />
            <div className="text-xl font-extrabold mb-1">แผน {plan.name}</div>
            <div className="text-white/70 text-sm mb-6">
              {plan.id === "enterprise" ? "ราคาพิเศษสำหรับองค์กร" : yearly ? "จ่ายรายปี ประหยัดกว่า" : "จ่ายรายเดือน"}
            </div>

            {/* Price */}
            {price !== null && price !== undefined ? (
              <div className="bg-white/10 rounded-2xl p-4 mb-6">
                <div className="text-4xl font-extrabold">{fmt(price)}</div>
                <div className="text-white/60 text-sm">บาท / {yearly ? "ปี" : "เดือน"}</div>
                {yearly && plan.monthlyPrice && (
                  <div className="text-xs text-white/50 mt-1 line-through">{fmt(plan.monthlyPrice * 12)} บาท/ปี</div>
                )}
              </div>
            ) : (
              <div className="bg-white/10 rounded-2xl p-4 mb-6">
                <div className="text-2xl font-extrabold">ติดต่อเรา</div>
                <div className="text-white/60 text-sm">เพื่อรับราคาพิเศษ</div>
              </div>
            )}

            {/* Limits */}
            <div className="space-y-2.5">
              {[
                { icon: BookOpen, label: "คอร์ส", val: plan.maxCourses === 0 ? "ไม่จำกัด" : `${plan.maxCourses} คอร์ส` },
                { icon: Users,    label: "นักเรียน", val: plan.maxStudents === 0 ? "ไม่จำกัด" : `${fmt(plan.maxStudents)} คน` },
                { icon: Building2,label: "สาขา", val: plan.maxBranches === 0 ? "ไม่จำกัด" : `${plan.maxBranches} สาขา` },
                { icon: Percent,  label: "Commission", val: `${plan.commission}%` },
              ].map(({ icon: Icon, label, val }) => (
                <div key={label} className="flex items-center gap-3 text-sm">
                  <div className="w-7 h-7 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-white/70">{label}:</span>
                  <span className="font-semibold">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom note */}
          <p className="text-white/50 text-xs mt-8">
            ทีมงานจะติดต่อกลับภายใน 1 วันทำการ
          </p>
        </div>

        {/* ─── Right panel ─── */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {/* Close */}
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>

          {success ? (
            /* ── Success state ── */
            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-9 h-9 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">ส่งข้อมูลสำเร็จ!</h2>
              <p className="text-gray-500 text-sm mb-4 max-w-xs leading-relaxed">
                ทีมงาน UPSkills จะติดต่อกลับทาง <strong className="text-indigo-600">{form.contactChannel}</strong> ภายใน 1 วันทำการ
              </p>
              <div className="bg-gray-50 rounded-2xl px-5 py-3 text-sm font-medium text-gray-700 mb-6">
                {form.contactId}
              </div>
              <button onClick={onClose}
                className="px-8 py-3 rounded-2xl text-white font-semibold text-sm bg-gradient-to-r from-violet-600 to-indigo-600">
                ปิด
              </button>
            </div>
          ) : (
            <>
              {/* Mobile plan badge */}
              <div className={`md:hidden inline-flex items-center gap-2 bg-gradient-to-r ${gradientCls} text-white text-xs font-bold px-3 py-1.5 rounded-full mb-4`}>
                แผน {plan.name} {price !== null && price !== undefined ? `· ${fmt(price)} บาท/${yearly ? "ปี" : "เดือน"}` : "· ติดต่อเรา"}
              </div>

              <h2 className="text-2xl font-extrabold text-gray-900 mb-1">ติดต่อเรา</h2>
              <p className="text-indigo-600 text-sm mb-6">กรุณากรอกข้อมูล เพื่อเปิดบัญชีทดลองใช้งาน</p>

              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Institution name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    ชื่อสถาบัน / โรงเรียน <span className="text-red-500">*</span>
                  </label>
                  <input
                    required type="text" value={form.institutionName}
                    onChange={(e) => setForm({ ...form, institutionName: e.target.value })}
                    placeholder="ระบุชื่อสถาบัน / โรงเรียนกวดวิชา"
                    className="w-full bg-gray-100 rounded-2xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    ชื่อ - นามสกุล <span className="text-red-500">*</span>
                  </label>
                  <input
                    required type="text" value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="ระบุชื่อ - นามสกุล"
                    className="w-full bg-gray-100 rounded-2xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    เบอร์ติดต่อ <span className="text-red-500">*</span>
                  </label>
                  <input
                    required type="tel" value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="ระบุเบอร์ติดต่อ"
                    className="w-full bg-gray-100 rounded-2xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    อีเมล <span className="text-red-500">*</span>
                  </label>
                  <input
                    required type="email" value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="ระบุอีเมล"
                    className="w-full bg-gray-100 rounded-2xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </div>

                {/* Contact channel */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ช่องทางรับข้อมูลเข้าใช้งาน <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {CONTACT_CHANNELS.map((ch) => {
                      const active = form.contactChannel === ch.value;
                      return (
                        <button key={ch.value} type="button"
                          onClick={() => setForm({ ...form, contactChannel: ch.value, contactId: "" })}
                          className={`flex flex-col items-center gap-1 py-3 px-2 rounded-2xl border-2 transition-all ${
                            active ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:border-gray-300 bg-white"
                          }`}
                        >
                          <img src={ch.logo} alt={ch.label} className="w-6 h-6 object-contain" />
                          <span className={`text-xs font-semibold ${active ? "text-indigo-700" : "text-gray-600"}`}>{ch.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {form.contactChannel ? (
                    <div className="flex items-center gap-2 bg-indigo-50 border-2 border-indigo-200 rounded-2xl px-4 py-3">
                      <img src={selectedChannel!.logo} alt={selectedChannel!.label} className="w-5 h-5 object-contain shrink-0" />
                      <input
                        required value={form.contactId}
                        onChange={(e) => setForm({ ...form, contactId: e.target.value })}
                        placeholder={selectedChannel!.placeholder}
                        className="flex-1 bg-transparent text-sm text-gray-700 placeholder-indigo-300 outline-none"
                      />
                      <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 rounded-xl px-3 py-2">
                      <ChevronDown className="w-3.5 h-3.5" />
                      เลือกช่องทางที่ต้องการรับข้อมูลเข้าใช้งาน
                    </div>
                  )}
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100">{error}</div>
                )}

                <button type="submit" disabled={loading}
                  className={`w-full py-3.5 rounded-2xl text-white font-semibold text-sm transition-opacity disabled:opacity-60 bg-gradient-to-r ${gradientCls}`}
                >
                  {loading ? "กำลังส่งข้อมูล..." : "ส่งข้อมูลติดต่อ"}
                </button>

                <p className="text-center text-xs text-gray-400">
                  ทีมงานจะติดต่อกลับภายใน 1 วันทำการ · ไม่มีค่าใช้จ่ายในการสอบถาม
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
