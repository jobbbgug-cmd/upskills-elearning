"use client";
import { useState, useEffect } from "react";
import { X, CheckCircle, User, GraduationCap, ChevronDown, Building2 } from "lucide-react";
import { GradeLevel } from "@/types";

interface Teacher { _id: string; name: string; }
interface Institution { _id: string; name: string; }

const GRADE_LEVELS: GradeLevel[] = [
  "ป.1","ป.2","ป.3","ป.4","ป.5","ป.6",
  "ม.1","ม.2","ม.3","ม.4","ม.5","ม.6",
  "ปวช.","ปวส.","มหาวิทยาลัย","ทั่วไป",
];

const CONTACT_CHANNELS = [
  { value: "LINE",      label: "LINE",      logo: "/logos/LINE.png",      placeholder: "LINE ID เช่น @username" },
  { value: "Facebook",  label: "Facebook",  logo: "/logos/Facebook.png",  placeholder: "ชื่อ Facebook หรือ URL" },
  { value: "Instagram", label: "Instagram", logo: "/logos/Instagram.png", placeholder: "Instagram @username" },
  { value: "WhatsApp",  label: "WhatsApp",  logo: "/logos/WhatsApp.png",  placeholder: "เบอร์ WhatsApp" },
  { value: "Email",     label: "Email",     logo: "/logos/Email.png",     placeholder: "อีเมลสำรอง" },
  { value: "SMS",       label: "SMS",       logo: "/logos/sms.png",       placeholder: "เบอร์โทรศัพท์" },
];

interface Props {
  defaultInstitutionId?: string;
  onClose: () => void;
}

export default function RegisterModal({ defaultInstitutionId, onClose }: Props) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "student" as "student" | "teacher",
    gradeLevel: "" as GradeLevel | "",
    teacherId: "",
    teacherName: "",
    contactChannel: "",
    contactId: "",
    institutionId: defaultInstitutionId ?? "",
  });
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);

  useEffect(() => {
    fetch("/api/teachers").then((r) => r.json()).then((d) => { if (Array.isArray(d)) setTeachers(d); });
    fetch("/api/institutions").then((r) => r.json()).then((d) => { if (Array.isArray(d)) setInstitutions(d); });
  }, []);

  const selectedChannel = CONTACT_CHANNELS.find((c) => c.value === form.contactChannel);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (institutions.length > 0 && !form.institutionId) { setError("กรุณาเลือกสถาบัน"); return; }
    if (!form.contactChannel) { setError("กรุณาเลือกช่องทางรับ Username/Password"); return; }
    if (!form.contactId.trim()) { setError("กรุณาระบุรายละเอียดช่องทางติดต่อ"); return; }
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 pt-20 pb-4">
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md text-left flex flex-col" style={{ maxHeight: "calc(100vh - 88px)" }}>

        {/* Header */}
        <div className="px-8 pt-7 pb-4 shrink-0">
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold text-gray-900">สมัครสมาชิก</h2>
          <p className="text-violet-500 text-sm mt-1">Admin จะส่ง Username/Password ให้ทางช่องทางที่เลือก</p>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-8 pb-8">
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-9 h-9 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">ส่งคำขอสำเร็จ!</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                ทีมงานจะส่ง <strong>Username / Password</strong><br />
                ให้ทาง <strong className="text-indigo-600">{form.contactChannel}</strong>: {form.contactId}
              </p>
              <button onClick={onClose} className="w-full py-3 rounded-2xl text-white font-semibold text-sm" style={{ background: "linear-gradient(90deg,#7c3aed,#6d28d9)" }}>
                ปิด
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role */}
              <div className="grid grid-cols-2 gap-3">
                {([
                  { value: "student", label: "นักเรียน", icon: User },
                  { value: "teacher", label: "ครู/อาจารย์", icon: GraduationCap },
                ] as const).map((r) => {
                  const Icon = r.icon;
                  const active = form.role === r.value;
                  return (
                    <button key={r.value} type="button" onClick={() => setForm({ ...form, role: r.value })}
                      className={`flex flex-col items-center gap-1 p-3.5 rounded-2xl border-2 transition-all ${active ? "border-violet-500 bg-violet-50" : "border-gray-200 hover:border-gray-300"}`}>
                      <Icon className={`w-5 h-5 ${active ? "text-violet-600" : "text-gray-400"}`} />
                      <span className={`text-sm font-semibold ${active ? "text-violet-700" : "text-gray-600"}`}>{r.label}</span>
                    </button>
                  );
                })}
              </div>

              <input type="text" required value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="ชื่อ-นามสกุล"
                className="w-full bg-gray-100 rounded-2xl px-4 py-3.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-violet-400"
              />

              <input type="email" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="อีเมล"
                className="w-full bg-gray-100 rounded-2xl px-4 py-3.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-violet-400"
              />

              {/* Institution — pre-selected */}
              {institutions.length > 0 && (
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <select required value={form.institutionId}
                    onChange={(e) => setForm({ ...form, institutionId: e.target.value })}
                    className="w-full bg-gray-100 rounded-2xl pl-10 pr-4 py-3.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-violet-400 appearance-none">
                    <option value="">-- เลือกสถาบัน --</option>
                    {institutions.map((i) => (
                      <option key={i._id} value={i._id}>{i.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              )}

              {form.role === "student" && (
                <>
                  <select value={form.gradeLevel}
                    onChange={(e) => setForm({ ...form, gradeLevel: e.target.value as GradeLevel })}
                    className="w-full bg-gray-100 rounded-2xl px-4 py-3.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-violet-400">
                    <option value="">-- ระดับชั้นที่กำลังเรียน --</option>
                    {GRADE_LEVELS.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>

                  <select value={form.teacherId}
                    onChange={(e) => {
                      const selected = teachers.find((t) => t._id === e.target.value);
                      setForm({ ...form, teacherId: e.target.value, teacherName: selected?.name ?? "" });
                    }}
                    className="w-full bg-gray-100 rounded-2xl px-4 py-3.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-violet-400">
                    <option value="">-- ครู/อาจารย์ผู้สอน --</option>
                    {teachers.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
                  </select>
                </>
              )}

              {/* Contact channel */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  ช่องทางรับ Username / Password <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {CONTACT_CHANNELS.map((ch) => {
                    const active = form.contactChannel === ch.value;
                    return (
                      <button key={ch.value} type="button"
                        onClick={() => setForm({ ...form, contactChannel: ch.value, contactId: "" })}
                        className={`flex flex-col items-center gap-1 py-3 px-2 rounded-2xl border-2 transition-all text-center ${active ? "border-violet-500 bg-violet-50" : "border-gray-200 hover:border-gray-300 bg-white"}`}>
                        <img src={ch.logo} alt={ch.label} className="w-7 h-7 object-contain" />
                        <span className={`text-xs font-semibold ${active ? "text-violet-700" : "text-gray-600"}`}>{ch.label}</span>
                      </button>
                    );
                  })}
                </div>
                {form.contactChannel && (
                  <div className="flex items-center gap-2 bg-violet-50 border-2 border-violet-200 rounded-2xl px-4 py-3">
                    <img src={selectedChannel?.logo} alt={selectedChannel?.label} className="w-5 h-5 object-contain shrink-0" />
                    <input required value={form.contactId}
                      onChange={(e) => setForm({ ...form, contactId: e.target.value })}
                      placeholder={selectedChannel?.placeholder}
                      className="flex-1 bg-transparent text-sm text-gray-700 placeholder-violet-300 outline-none"
                    />
                  </div>
                )}
              </div>

              {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100">{error}</div>}

              <button type="submit" disabled={loading}
                className="w-full py-3.5 rounded-2xl text-white font-semibold text-sm transition-opacity disabled:opacity-60"
                style={{ background: "linear-gradient(90deg,#7c3aed,#6d28d9)" }}>
                {loading ? "กำลังส่งคำขอ..." : "ส่งคำขอสมัครสมาชิก"}
              </button>

              <p className="text-center text-sm text-gray-500">
                มีบัญชีแล้ว?{" "}
                <a href="/login" className="font-medium text-violet-600 hover:underline">เข้าสู่ระบบ</a>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
