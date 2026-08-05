"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, FileText, ChevronRight, Trash2, Clock, Users, ToggleLeft, ToggleRight, X } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

interface Course { _id: string; title: string; }
interface Quiz {
  _id: string; title: string; description: string; timeLimit: number;
  maxAttempts: number; isActive: boolean; questions: unknown[];
  courseId?: { _id: string; title: string } | null;
  createdBy?: { name: string };
  createdAt: string;
}

export default function AdminQuizPage() {
  const [quizzes,  setQuizzes]  = useState<Quiz[]>([]);
  const [courses,  setCourses]  = useState<Course[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    courseId: "", title: "", description: "",
    timeLimit: 30, maxAttempts: 1,
    randomizeQuestions: true, randomizeOptions: false, showResultAfter: true,
  });

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      fetch("/api/quiz",           { signal: controller.signal }).then((r) => r.json()),
      fetch("/api/owner/courses",  { signal: controller.signal }).then((r) => r.json()),
    ]).then(([q, c]) => {
      setQuizzes(Array.isArray(q) ? q : []);
      const cs = Array.isArray(c) ? c : c.courses ?? [];
      setCourses(cs);
    }).catch(() => {}).finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  const handleCreate = async () => {
    if (!form.title) return;
    setCreating(true);
    const res = await fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, courseId: form.courseId || null }),
    });
    if (res.ok) {
      const q = await res.json();
      setQuizzes([q, ...quizzes]);
      setShowForm(false);
      setForm({ courseId: "", title: "", description: "", timeLimit: 30, maxAttempts: 1, randomizeQuestions: true, randomizeOptions: false, showResultAfter: true });
    }
    setCreating(false);
  };

  const toggleActive = async (id: string, current: boolean) => {
    const res = await fetch(`/api/quiz/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current }),
    });
    if (res.ok) setQuizzes((prev) => prev.map((q) => q._id === id ? { ...q, isActive: !current } : q));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ลบข้อสอบนี้และผลการทำทั้งหมด?")) return;
    const res = await fetch(`/api/quiz/${id}`, { method: "DELETE" });
    if (res.ok) setQuizzes((prev) => prev.filter((q) => q._id !== id));
  };

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white";
  const Toggle = ({ on, label, onChange }: { on: boolean; label: string; onChange: () => void }) => (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <button type="button" onClick={onChange} className={`shrink-0 transition-colors ${on ? "theme-toggle-on" : "theme-toggle-off"}`}>
        {on ? <ToggleRight className="w-7 h-7" /> : <ToggleLeft className="w-7 h-7" />}
      </button>
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ข้อสอบ / Quiz</h1>
          <p className="text-gray-500 text-sm mt-1">สร้างและจัดการข้อสอบ</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 theme-button text-sm font-semibold rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> สร้างข้อสอบ
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : quizzes.length === 0 ? (
        <div className="text-center py-20 text-gray-300">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm">ยังไม่มีข้อสอบ</p>
        </div>
      ) : (
        <div className="space-y-3">
          {quizzes.map((q) => (
            <div key={q._id} className={`bg-white rounded-2xl border p-5 flex items-center gap-4 transition-colors ${q.isActive ? "border-gray-100" : "border-gray-100 opacity-60"}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${q.isActive ? "bg-indigo-50" : "bg-gray-100"}`}>
                <FileText className={`w-5 h-5 ${q.isActive ? "text-indigo-500" : "text-gray-400"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{q.title}</p>
                <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-400">
                  {q.courseId && <span className="text-indigo-500">{(q.courseId as { title: string }).title}</span>}
                  <span className="flex items-center gap-1"><FileText className="w-3 h-3" />{q.questions.length} ข้อ</span>
                  {q.timeLimit > 0 && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{q.timeLimit} นาที</span>}
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />ทำได้ {q.maxAttempts === 0 ? "ไม่จำกัด" : `${q.maxAttempts} ครั้ง`}</span>
                </div>
              </div>
              <button onClick={() => toggleActive(q._id, q.isActive)} title={q.isActive ? "ปิดข้อสอบ" : "เปิดข้อสอบ"}
                className={`shrink-0 transition-colors ${q.isActive ? "text-indigo-500 hover:text-indigo-700" : "text-gray-300 hover:text-indigo-400"}`}>
                {q.isActive ? <ToggleRight className="w-7 h-7" /> : <ToggleLeft className="w-7 h-7" />}
              </button>
              <Link href={`/owner/quiz/${q._id}`}
                className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 font-medium shrink-0">
                จัดการ <ChevronRight className="w-3.5 h-3.5" />
              </Link>
              <button onClick={() => handleDelete(q._id)} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
              <h2 className="text-lg font-bold text-gray-900">สร้างข้อสอบใหม่</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="px-6 py-5 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">ชื่อข้อสอบ <span className="text-red-500">*</span></label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} placeholder="เช่น สอบกลางภาค บทที่ 1-3" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">คอร์ส (ถ้ามี)</label>
                <select value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })} className={inputCls}>
                  <option value="">— ไม่ระบุ (ทุกคนทำได้) —</option>
                  {courses.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">คำอธิบาย</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2} className={`${inputCls} resize-none`} placeholder="คำอธิบายหรือข้อแนะนำสำหรับผู้เข้าสอบ..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">เวลา (นาที)</label>
                  <input type="number" value={form.timeLimit} onChange={(e) => setForm({ ...form, timeLimit: Number(e.target.value) })}
                    min={0} className={inputCls} />
                  <p className="text-xs text-gray-400 mt-1">0 = ไม่จำกัดเวลา</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">ทำได้กี่ครั้ง</label>
                  <input type="number" value={form.maxAttempts} onChange={(e) => setForm({ ...form, maxAttempts: Number(e.target.value) })}
                    min={0} className={inputCls} />
                  <p className="text-xs text-gray-400 mt-1">0 = ไม่จำกัด</p>
                </div>
              </div>
              <div className="space-y-2.5 pt-1">
                <Toggle on={form.randomizeQuestions} label="สุ่มลำดับข้อสอบ" onChange={() => setForm((f) => ({ ...f, randomizeQuestions: !f.randomizeQuestions }))} />
                <Toggle on={form.randomizeOptions}   label="สุ่มลำดับตัวเลือก" onChange={() => setForm((f) => ({ ...f, randomizeOptions: !f.randomizeOptions }))} />
                <Toggle on={form.showResultAfter}    label="แสดงเฉลยหลังส่งคำตอบ" onChange={() => setForm((f) => ({ ...f, showResultAfter: !f.showResultAfter }))} />
              </div>
            </div>
            <div className="flex gap-3 px-6 py-5 border-t border-gray-100 shrink-0">
              <button onClick={handleCreate} disabled={creating || !form.title}
                className="flex-1 py-2.5 theme-button font-semibold rounded-xl disabled:opacity-50 transition-colors text-sm">
                {creating ? "กำลังสร้าง..." : "สร้างข้อสอบ"}
              </button>
              <button onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors text-sm">ยกเลิก</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
