"use client";
import { useState } from "react";
import { X, CheckCircle2, Loader2, MoveRight } from "lucide-react";

const INSTITUTION_TYPES = [
  "โรงเรียนสอนพิเศษ",
  "ติวเตอร์เดี่ยว",
  "สถาบันฝึกอบรม",
  "มหาวิทยาลัย/วิทยาลัย",
  "อื่นๆ",
];

const CHANNEL_OPTIONS = [
  { value: "line", label: "LINE ID" },
  { value: "email", label: "อีเมล" },
  { value: "phone", label: "เบอร์โทรศัพท์" },
];

interface Form {
  institutionName: string;
  fullName: string;
  phone: string;
  institutionType: string;
  contactChannel: string;
  contactValue: string;
}

export default function TrialRequestModal({ navbar, children }: { navbar?: boolean; children?: React.ReactNode } = {}) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<Form>({
    institutionName: "",
    fullName: "",
    phone: "",
    institutionType: "",
    contactChannel: "line",
    contactValue: "",
  });

  const set = (key: keyof Form, val: string) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.institutionName || !form.fullName || !form.phone || !form.institutionType || !form.contactValue) {
      setError("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/trial-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "เกิดข้อผิดพลาด");
      } else {
        setDone(true);
      }
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setDone(false);
    setError("");
    setForm({ institutionName: "", fullName: "", phone: "", institutionType: "", contactChannel: "line", contactValue: "" });
  };

  const channelLabel = CHANNEL_OPTIONS.find((o) => o.value === form.contactChannel)?.label ?? "";

  return (
    <>
      {children ? (
        <span onClick={() => setOpen(true)} className="cursor-pointer">{children}</span>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className={navbar
            ? "text-sm font-light px-5 py-2 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 text-white hover:from-blue-600 hover:to-violet-600 transition-all whitespace-nowrap shadow"
            : "bg-gradient-to-r from-blue-500 to-violet-500 text-white font-light px-8 py-3.5 rounded-full hover:from-blue-600 hover:to-violet-600 transition-all shadow-md whitespace-nowrap"
          }
        >
          <span className="flex items-center gap-2">ทดลองใช้งาน ฟรี! <MoveRight className="w-4 h-4" strokeWidth={1.5} /></span>
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 pt-20 pb-4">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex overflow-hidden text-left" style={{ height: "calc(100vh - 88px)" }}>

            {/* Left: hero image */}
            <div className="hidden md:flex w-[52%] shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/trial-hero.jpg"
                alt="ทดลองใช้งานฟรี"
                className="w-full h-full object-cover object-top"
              />
            </div>

            {/* Right: scrollable form */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Sticky header with close button */}
              <div className="sticky top-0 z-10 flex items-center justify-end px-5 pt-4 pb-2 bg-white">
                <button
                  onClick={handleClose}
                  className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 px-7 pb-7 pt-1">
                {done ? (
                  <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                    <CheckCircle2 className="w-16 h-16 text-teal-500 mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">ส่งข้อมูลเรียบร้อยแล้ว!</h3>
                    <p className="text-gray-400 text-sm mb-6">ทีมงานจะติดต่อกลับภายใน 1-2 วันทำการ</p>
                    <button
                      onClick={handleClose}
                      className="bg-teal-500 text-white px-8 py-2.5 rounded-full hover:bg-teal-600 transition-colors font-light"
                    >
                      ปิด
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-teal-500 mb-1">ติดต่อเรา</h2>
                    <p className="text-gray-400 text-sm mb-6">กรุณากรอกข้อมูล เพื่อเปิดบัญชีทดลองใช้งาน</p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          ชื่อสถาบัน <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={form.institutionName}
                          onChange={(e) => set("institutionName", e.target.value)}
                          placeholder="ระบุชื่อสถาบัน"
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-gray-50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          ชื่อ - นามสกุล <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={form.fullName}
                          onChange={(e) => set("fullName", e.target.value)}
                          placeholder="ระบุชื่อ - นามสกุล"
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-gray-50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          เบอร์ติดต่อ <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={(e) => set("phone", e.target.value)}
                          placeholder="ระบุเบอร์ติดต่อ"
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-gray-50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ประเภทสถาบัน <span className="text-red-500">*</span>
                        </label>
                        <div className="space-y-2">
                          {INSTITUTION_TYPES.map((type) => (
                            <label key={type} className="flex items-center gap-3 cursor-pointer group">
                              <input
                                type="radio"
                                name="institutionType"
                                value={type}
                                checked={form.institutionType === type}
                                onChange={() => set("institutionType", type)}
                                className="accent-teal-500 w-4 h-4 shrink-0"
                              />
                              <span className="text-sm text-gray-600 group-hover:text-teal-600 transition-colors">{type}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ช่องทางรับ Username/Password <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-2 mb-3">
                          {CHANNEL_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => { set("contactChannel", opt.value); set("contactValue", ""); }}
                              className={`flex-1 py-2 rounded-full text-sm border transition-colors ${
                                form.contactChannel === opt.value
                                  ? "bg-teal-500 text-white border-teal-500"
                                  : "bg-white text-gray-500 border-gray-200 hover:border-teal-400"
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                        <input
                          type={form.contactChannel === "email" ? "email" : "text"}
                          value={form.contactValue}
                          onChange={(e) => set("contactValue", e.target.value)}
                          placeholder={
                            form.contactChannel === "line" ? "LINE ID ของท่าน" :
                            form.contactChannel === "email" ? "อีเมลของท่าน" :
                            "เบอร์โทรศัพท์"
                          }
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-gray-50"
                        />
                        <p className="text-xs text-gray-400 mt-1">ทีมงานจะส่ง Username/Password ผ่าน{channelLabel}นี้</p>
                      </div>

                      {error && (
                        <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2.5">{error}</p>
                      )}

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-teal-500 text-white py-3 rounded-full hover:bg-teal-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 font-light mt-2"
                      >
                        {loading
                          ? <><Loader2 className="w-4 h-4 animate-spin" /> กำลังส่งข้อมูล...</>
                          : <><span>ส่งข้อมูล</span><MoveRight className="w-4 h-4" strokeWidth={1.5} /></>
                        }
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
