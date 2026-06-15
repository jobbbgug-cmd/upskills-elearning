"use client";
import { useState } from "react";
import { X, CheckCircle2 } from "lucide-react";

const CONTACT_CHANNELS = ["LINE", "Facebook", "Instagram", "WhatsApp", "โทรศัพท์", "อีเมล"];
const GRADE_LEVELS = [
  "ป.1","ป.2","ป.3","ป.4","ป.5","ป.6",
  "ม.1","ม.2","ม.3","ม.4","ม.5","ม.6",
  "ปวช.","ปวส.","มหาวิทยาลัย","ทั่วไป",
];

interface Props {
  institutionId?: string;
  institutionName?: string;
  onClose: () => void;
}

export default function BannerRegisterModal({ institutionId, institutionName, onClose }: Props) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    gradeLevel: "",
    contactChannel: "LINE",
    contactId: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState(false);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.contactId) {
      setError("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    setSubmitting(true);
    setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        role: "student",
        gradeLevel: form.gradeLevel,
        contactChannel: form.contactChannel,
        contactId: form.contactId,
        institutionId: institutionId ?? null,
      }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (res.ok) setSuccess(true);
    else setError(data.error ?? "เกิดข้อผิดพลาด กรุณาลองใหม่");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">สมัครสมาชิก</h2>
            {institutionName && <p className="text-sm text-indigo-600 font-medium mt-0.5">{institutionName}</p>}
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="px-6 py-10 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">ส่งคำขอสำเร็จ!</h3>
            <p className="text-gray-500 text-sm mb-6">
              ทีมงานจะติดต่อกลับผ่าน {form.contactChannel}: <span className="font-medium text-gray-800">{form.contactId}</span><br/>
              เพื่อส่ง Username/Password ให้คุณค่ะ
            </p>
            <button onClick={onClose}
              className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors">
              ปิด
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ชื่อ-นามสกุล *</label>
              <input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="กรอกชื่อ-นามสกุล"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">อีเมล *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="example@email.com"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ระดับชั้น</label>
              <select
                value={form.gradeLevel}
                onChange={(e) => set("gradeLevel", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">— ไม่ระบุ —</option>
                {GRADE_LEVELS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ช่องทางรับ Username/Password *</label>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {CONTACT_CHANNELS.map((ch) => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => set("contactChannel", ch)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                      form.contactChannel === ch
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white border-gray-200 text-gray-600 hover:border-indigo-300"
                    }`}
                  >
                    {ch}
                  </button>
                ))}
              </div>
              <input
                value={form.contactId}
                onChange={(e) => set("contactId", e.target.value)}
                placeholder={`${form.contactChannel} ID / เบอร์โทร / อีเมล`}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-xl">{error}</p>}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors text-sm"
              >
                {submitting ? "กำลังส่ง..." : "ส่งคำขอสมัครสมาชิก"}
              </button>
              <button type="button" onClick={onClose}
                className="px-5 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors text-sm">
                ยกเลิก
              </button>
            </div>

            <p className="text-xs text-gray-400 text-center pb-1">
              ทีมงานจะติดต่อส่ง Username/Password หลังจากตรวจสอบข้อมูล
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
