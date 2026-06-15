"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, CheckCircle, User, GraduationCap, ChevronDown, Building2 } from "lucide-react";
import { GradeLevel } from "@/types";

interface Teacher { _id: string; name: string; }
interface Institution { _id: string; name: string; }

const GRADE_LEVELS: GradeLevel[] = [
  "ป.1", "ป.2", "ป.3", "ป.4", "ป.5", "ป.6",
  "ม.1", "ม.2", "ม.3", "ม.4", "ม.5", "ม.6",
  "ปวช.", "ปวส.", "มหาวิทยาลัย", "ทั่วไป",
];

const CONTACT_CHANNELS = [
  { value: "LINE",      label: "LINE",      logo: "/logos/LINE.png",      emoji: "💬", placeholder: "LINE ID เช่น @username หรือ 0812345678" },
  { value: "Facebook",  label: "Facebook",  logo: "/logos/Facebook.png",  emoji: "📘", placeholder: "ชื่อ Facebook หรือ URL โปรไฟล์" },
  { value: "Instagram", label: "Instagram", logo: "/logos/Instagram.png", emoji: "📸", placeholder: "Instagram @username" },
  { value: "WhatsApp",  label: "WhatsApp",  logo: "/logos/WhatsApp.png",  emoji: "📞", placeholder: "เบอร์โทร WhatsApp เช่น 0812345678" },
  { value: "Email",     label: "Email",     logo: "/logos/Email.png",     emoji: "✉️", placeholder: "อีเมลสำรอง เช่น name@gmail.com" },
  { value: "SMS",       label: "SMS",       logo: "/logos/sms.png",       emoji: "📱", placeholder: "เบอร์โทรศัพท์ เช่น 0812345678" },
];

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "student" as "student" | "teacher",
    gradeLevel: "" as GradeLevel | "",
    teacherId: "",
    teacherName: "",
    contactChannel: "",
    contactId: "",
    institutionId: "",
  });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);

  useEffect(() => {
    fetch("/api/teachers").then((r) => r.json()).then((data) => {
      if (Array.isArray(data)) setTeachers(data);
    });
    fetch("/api/institutions").then((r) => r.json()).then((data) => {
      if (Array.isArray(data)) setInstitutions(data);
    });
  }, []);

  const selectedChannel = CONTACT_CHANNELS.find((c) => c.value === form.contactChannel);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (institutions.length > 0 && !form.institutionId) { setError("กรุณาเลือกสถาบัน"); return; }
    if (!form.contactChannel) { setError("กรุณาเลือกช่องทางการรับ Username/Password"); return; }
    if (!form.contactId.trim()) { setError("กรุณาระบุรายละเอียดช่องทางการติดต่อ"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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

  if (success) {
    return (
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Image src="/logo.png" alt="UPSkills" width={260} height={90} className="object-contain" priority />
        </div>
        <div className="bg-white rounded-3xl shadow-xl p-10 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-9 h-9 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">ส่งคำขอสำเร็จ!</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-2">
            คำขอสมัครสมาชิกของคุณถูกส่งแล้ว<br />
            {form.teacherName && <><strong className="text-violet-600">ครู {form.teacherName}</strong> จะตรวจสอบและ</>}
            ส่ง <strong>Username / Password</strong><br />
            ให้ทาง <strong className="text-indigo-600">{selectedChannel?.emoji} {form.contactChannel}</strong>
          </p>
          <p className="text-sm font-medium text-gray-700 bg-gray-50 rounded-xl px-4 py-2 mb-6">
            {form.contactId}
          </p>
          <Link href="/login" className="inline-block w-full py-3 rounded-2xl text-white font-semibold text-sm text-center" style={{ background: "linear-gradient(90deg,#7c3aed,#6d28d9)" }}>
            กลับหน้าเข้าสู่ระบบ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="flex justify-center mb-8">
        <Image src="/logo.png" alt="UPSkills" width={260} height={90} className="object-contain" priority />
      </div>

      <div className="bg-white rounded-3xl shadow-xl p-10">
        <div className="text-center mb-7">
          <h1 className="text-2xl font-bold text-gray-900">สมัครสมาชิก</h1>
          <p className="text-violet-500 text-sm mt-1.5">Admin จะส่ง Username/Password ให้ทางช่องทางที่เลือก</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Role */}
          <div className="grid grid-cols-2 gap-3">
            {([
              { value: "student", label: "นักเรียน", icon: User, desc: "ผู้เรียน" },
              { value: "teacher", label: "ครู/อาจารย์", icon: GraduationCap, desc: "ผู้สอน" },
            ] as const).map((r) => {
              const Icon = r.icon;
              const active = form.role === r.value;
              return (
                <button key={r.value} type="button" onClick={() => setForm({ ...form, role: r.value })}
                  className={`flex flex-col items-center gap-1 p-3.5 rounded-2xl border-2 transition-all ${active ? "border-violet-500 bg-violet-50" : "border-gray-200 hover:border-gray-300"}`}
                >
                  <Icon className={`w-5 h-5 ${active ? "text-violet-600" : "text-gray-400"}`} />
                  <span className={`text-sm font-semibold ${active ? "text-violet-700" : "text-gray-600"}`}>{r.label}</span>
                </button>
              );
            })}
          </div>

          {/* Name */}
          <input
            type="text" required value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="ชื่อ-นามสกุล"
            className="w-full bg-gray-100 rounded-2xl px-4 py-3.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-violet-400"
          />

          {/* Email */}
          <input
            type="email" required value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="อีเมล"
            className="w-full bg-gray-100 rounded-2xl px-4 py-3.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-violet-400"
          />

          {/* Institution */}
          {institutions.length > 0 && (
            <div className="relative">
              <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <select
                required
                value={form.institutionId}
                onChange={(e) => setForm({ ...form, institutionId: e.target.value })}
                className="w-full bg-gray-100 rounded-2xl pl-10 pr-4 py-3.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-violet-400 appearance-none"
              >
                <option value="">-- เลือกสถาบัน --</option>
                {institutions.map((i) => (
                  <option key={i._id} value={i._id}>{i.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          )}

          {/* Grade level + Teacher — student only */}
          {form.role === "student" && (
            <>
              <select
                value={form.gradeLevel}
                onChange={(e) => setForm({ ...form, gradeLevel: e.target.value as GradeLevel })}
                className="w-full bg-gray-100 rounded-2xl px-4 py-3.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-violet-400"
              >
                <option value="">-- ระดับชั้นที่กำลังเรียน --</option>
                {GRADE_LEVELS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>

              <select
                value={form.teacherId}
                onChange={(e) => {
                  const selected = teachers.find((t) => t._id === e.target.value);
                  setForm({ ...form, teacherId: e.target.value, teacherName: selected?.name ?? "" });
                }}
                className="w-full bg-gray-100 rounded-2xl px-4 py-3.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-violet-400"
              >
                <option value="">-- ครู/อาจารย์ผู้สอน --</option>
                {teachers.map((t) => (
                  <option key={t._id} value={t._id}>{t.name}</option>
                ))}
              </select>
            </>
          )}

          {/* Contact channel */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              ช่องทางรับ Username / Password <span className="text-red-500">*</span>
            </label>

            {/* Channel grid */}
            <div className="grid grid-cols-3 gap-2">
              {CONTACT_CHANNELS.map((ch) => {
                const active = form.contactChannel === ch.value;
                return (
                  <button
                    key={ch.value} type="button"
                    onClick={() => setForm({ ...form, contactChannel: ch.value, contactId: "" })}
                    className={`flex flex-col items-center gap-1 py-3 px-2 rounded-2xl border-2 transition-all text-center ${
                      active ? "border-violet-500 bg-violet-50" : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    {ch.logo ? (
                      <img src={ch.logo} alt={ch.label} className="w-7 h-7 object-contain" />
                    ) : (
                      <span className="text-xl leading-none">{ch.emoji}</span>
                    )}
                    <span className={`text-xs font-semibold ${active ? "text-violet-700" : "text-gray-600"}`}>
                      {ch.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Contact ID input — shown after selecting channel */}
            {form.contactChannel && (
              <div className="flex items-center gap-2 bg-violet-50 border-2 border-violet-200 rounded-2xl px-4 py-3">
                {selectedChannel?.logo ? (
                  <img src={selectedChannel.logo} alt={selectedChannel.label} className="w-5 h-5 object-contain shrink-0" />
                ) : (
                  <span className="text-lg shrink-0">{selectedChannel?.emoji}</span>
                )}
                <input
                  required
                  value={form.contactId}
                  onChange={(e) => setForm({ ...form, contactId: e.target.value })}
                  placeholder={selectedChannel?.placeholder}
                  className="flex-1 bg-transparent text-sm text-gray-700 placeholder-violet-300 outline-none"
                />
              </div>
            )}

            {/* Helper */}
            {!form.contactChannel && (
              <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 rounded-xl px-3 py-2">
                <ChevronDown className="w-3.5 h-3.5" />
                เลือกช่องทางที่ต้องการรับข้อมูลเข้าใช้งาน
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100">{error}</div>
          )}

          <button
            type="submit" disabled={loading}
            className="w-full py-3.5 rounded-2xl text-white font-semibold text-sm transition-opacity disabled:opacity-60"
            style={{ background: "linear-gradient(90deg,#7c3aed,#6d28d9)" }}
          >
            {loading ? "กำลังส่งคำขอ..." : "ส่งคำขอสมัครสมาชิก"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          มีบัญชีแล้ว?{" "}
          <Link href="/login" className="font-medium hover:underline" style={{ color: "#7c3aed" }}>เข้าสู่ระบบ</Link>
        </p>
      </div>

      <div className="text-center mt-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium" style={{ color: "#7c3aed" }}>
          <ArrowLeft className="w-4 h-4" />กลับหน้าแรก
        </Link>
      </div>
    </div>
  );
}
