"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, BookOpen, ChevronRight, Trash2, Clock, CheckCircle2, X, Upload, Loader2 } from "lucide-react";

interface Course { _id: string; title: string; }
interface Homework {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
  isActive: boolean;
  courseId: { _id: string; title: string } | string;
  createdBy: { name: string } | string;
  createdAt: string;
}

export default function AdminHomeworkPage() {
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [courses,   setCourses]   = useState<Course[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [creating,  setCreating]  = useState(false);
  const [showForm,  setShowForm]  = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    courseId: "", title: "", description: "",
    dueDate: "", maxScore: 100,
    attachments: [] as { name: string; url: string }[],
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/homework").then((r) => r.json()),
      fetch("/api/admin/courses").then((r) => r.json()),
    ]).then(([hw, cs]) => {
      setHomeworks(hw);
      setCourses(Array.isArray(cs) ? cs : cs.courses ?? []);
    }).finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!form.courseId || !form.title || !form.dueDate) return;
    setCreating(true);
    const res = await fetch("/api/homework", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const hw = await res.json();
      setHomeworks([hw, ...homeworks]);
      setShowForm(false);
      setForm({ courseId: "", title: "", description: "", dueDate: "", maxScore: 100, attachments: [] });
    }
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ลบการบ้านนี้?")) return;
    const res = await fetch(`/api/homework/${id}`, { method: "DELETE" });
    if (res.ok) setHomeworks(homeworks.filter((h) => h._id !== id));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res  = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.url) {
      setForm((f) => ({ ...f, attachments: [...f.attachments, { name: file.name, url: data.url }] }));
    }
    setUploading(false);
    e.target.value = "";
  };

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white";

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">การบ้าน</h1>
          <p className="text-gray-500 text-sm mt-1">สร้างและจัดการการบ้านสำหรับนักเรียน</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors">
          <Plus className="w-4 h-4" /> สร้างการบ้าน
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">กำลังโหลด...</div>
      ) : homeworks.length === 0 ? (
        <div className="text-center py-20 text-gray-300">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm">ยังไม่มีการบ้าน</p>
        </div>
      ) : (
        <div className="space-y-3">
          {homeworks.map((hw) => {
            const course = typeof hw.courseId === "object" ? hw.courseId : null;
            const due    = new Date(hw.dueDate);
            const isPast = due < new Date();
            return (
              <div key={hw._id} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isPast ? "bg-gray-100" : "bg-indigo-50"}`}>
                  {isPast ? <CheckCircle2 className="w-5 h-5 text-gray-400" /> : <Clock className="w-5 h-5 text-indigo-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{hw.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {course?.title ?? "—"} · ส่งภายใน {due.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}
                    {" "}· คะแนนเต็ม {hw.maxScore}
                  </p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold shrink-0 ${isPast ? "bg-gray-100 text-gray-500" : "bg-green-50 text-green-700"}`}>
                  {isPast ? "หมดเวลา" : "เปิดรับ"}
                </span>
                <Link href={`/admin/homework/${hw._id}`}
                  className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 font-medium shrink-0">
                  ดูงานที่ส่ง <ChevronRight className="w-3.5 h-3.5" />
                </Link>
                <button onClick={() => handleDelete(hw._id)}
                  className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Create modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
              <h2 className="text-lg font-bold text-gray-900">สร้างการบ้านใหม่</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">คอร์ส <span className="text-red-500">*</span></label>
                <select value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })} className={inputCls}>
                  <option value="">— เลือกคอร์ส —</option>
                  {courses.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">หัวข้อการบ้าน <span className="text-red-500">*</span></label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} placeholder="เช่น บทที่ 1 แบบฝึกหัด" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">คำอธิบาย</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3} className={`${inputCls} resize-none`} placeholder="รายละเอียดการบ้าน..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">วันกำหนดส่ง <span className="text-red-500">*</span></label>
                  <input type="datetime-local" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">คะแนนเต็ม</label>
                  <input type="number" value={form.maxScore} onChange={(e) => setForm({ ...form, maxScore: Number(e.target.value) })} className={inputCls} min={1} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">ไฟล์แนบ (เอกสารประกอบ)</label>
                <label className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-gray-300 rounded-xl text-sm text-gray-500 cursor-pointer hover:bg-gray-50 transition-colors">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploading ? "กำลังอัปโหลด..." : "เลือกไฟล์"}
                  <input type="file" className="hidden" onChange={handleFileUpload} />
                </label>
                {form.attachments.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {form.attachments.map((a, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
                        <span className="flex-1 truncate">{a.name}</span>
                        <button onClick={() => setForm((f) => ({ ...f, attachments: f.attachments.filter((_, j) => j !== i) }))}
                          className="text-gray-400 hover:text-red-500"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3 px-6 py-5 border-t border-gray-100 shrink-0">
              <button onClick={handleCreate} disabled={creating || !form.courseId || !form.title || !form.dueDate}
                className="flex-1 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors text-sm">
                {creating ? "กำลังสร้าง..." : "สร้างการบ้าน"}
              </button>
              <button onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors text-sm">
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
