"use client";
import { useState, useEffect } from "react";
import { Plus, Video, Clock, Trash2, Radio, CheckCircle2, Link2, X, CalendarDays, ChevronRight } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

interface LiveSess {
  _id: string; title: string; description: string; meetLink: string;
  scheduledAt: string; duration: number; status: "upcoming" | "live" | "ended";
  replayLink: string;
  courseId?: { _id: string; title: string } | null;
  createdBy?: { name: string };
}
interface Course { _id: string; title: string; }

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  upcoming: { label: "กำลังจะมา",   cls: "bg-blue-50 text-blue-600" },
  live:     { label: "🔴 Live อยู่",  cls: "bg-red-50 text-red-600 animate-pulse" },
  ended:    { label: "จบแล้ว",        cls: "bg-gray-100 text-gray-400" },
};

export default function AdminLivePage() {
  const [sessions, setSessions] = useState<LiveSess[]>([]);
  const [courses,  setCourses]  = useState<Course[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [editReplay, setEditReplay] = useState<{ id: string; link: string } | null>(null);
  const [form, setForm] = useState({
    title: "", description: "", courseId: "", meetLink: "",
    scheduledAt: "", duration: 60,
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/live").then((r) => r.json()),
      fetch("/api/admin/courses").then((r) => r.json()),
    ]).then(([s, c]) => {
      setSessions(Array.isArray(s) ? s : []);
      const cs = Array.isArray(c) ? c : c.courses ?? [];
      setCourses(cs);
    }).finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!form.title || !form.scheduledAt) return;
    setSaving(true);
    const res = await fetch("/api/live", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, courseId: form.courseId || null }),
    });
    if (res.ok) {
      const s = await res.json();
      setSessions([s, ...sessions]);
      setShowForm(false);
      setForm({ title: "", description: "", courseId: "", meetLink: "", scheduledAt: "", duration: 60 });
    }
    setSaving(false);
  };

  const setStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/live/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const s = await res.json();
      setSessions((prev) => prev.map((x) => x._id === id ? s : x));
    }
  };

  const saveReplay = async () => {
    if (!editReplay) return;
    const res = await fetch(`/api/live/${editReplay.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ replayLink: editReplay.link }),
    });
    if (res.ok) {
      const s = await res.json();
      setSessions((prev) => prev.map((x) => x._id === editReplay.id ? s : x));
      setEditReplay(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ลบ Live Session นี้?")) return;
    const res = await fetch(`/api/live/${id}`, { method: "DELETE" });
    if (res.ok) setSessions((prev) => prev.filter((x) => x._id !== id));
  };

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white";

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Radio className="w-5 h-5 text-red-500" />Live Class</h1>
          <p className="text-gray-500 text-sm mt-1">จัดการห้องเรียน Live</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 theme-button text-sm font-semibold rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> สร้าง Live ใหม่
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : sessions.length === 0 ? (
        <div className="text-center py-20 text-gray-300">
          <Video className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm">ยังไม่มี Live Session</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => {
            const st = STATUS_LABEL[s.status];
            const dt = new Date(s.scheduledAt);
            return (
              <div key={s._id} className={`bg-white rounded-2xl border p-5 ${s.status === "live" ? "border-red-200 shadow-sm shadow-red-100" : "border-gray-100"}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.status === "live" ? "bg-red-50" : s.status === "upcoming" ? "bg-blue-50" : "bg-gray-50"}`}>
                    <Video className={`w-5 h-5 ${s.status === "live" ? "text-red-500" : s.status === "upcoming" ? "text-blue-500" : "text-gray-300"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900">{s.title}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.cls}`}>{st.label}</span>
                    </div>
                    {s.courseId && <p className="text-xs text-indigo-500 mt-0.5">{(s.courseId as { title: string }).title}</p>}
                    <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />
                        {dt.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />
                        {dt.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} ({s.duration} นาที)
                      </span>
                      {s.meetLink && (
                        <a href={s.meetLink} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1 text-indigo-500 hover:text-indigo-700">
                          <Link2 className="w-3 h-3" />ลิงก์ห้องเรียน
                        </a>
                      )}
                      {s.replayLink && (
                        <a href={s.replayLink} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1 text-violet-500 hover:text-violet-700">
                          <Video className="w-3 h-3" />ดู Replay
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                    {s.status === "upcoming" && (
                      <button onClick={() => setStatus(s._id, "live")}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-lg hover:bg-red-600 transition-colors">
                        <Radio className="w-3.5 h-3.5" /> Go Live
                      </button>
                    )}
                    {s.status === "live" && (
                      <button onClick={() => setStatus(s._id, "ended")}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-500 text-white text-xs font-semibold rounded-lg hover:bg-gray-600 transition-colors">
                        <CheckCircle2 className="w-3.5 h-3.5" /> จบการสอน
                      </button>
                    )}
                    {s.status === "ended" && (
                      <button onClick={() => setEditReplay({ id: s._id, link: s.replayLink })}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 text-violet-600 text-xs font-semibold rounded-lg hover:bg-violet-100 transition-colors">
                        <Link2 className="w-3.5 h-3.5" /> ใส่ Replay
                      </button>
                    )}
                    <button onClick={() => handleDelete(s._id)}
                      className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
              <h2 className="text-lg font-bold text-gray-900">สร้าง Live ใหม่</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="px-6 py-5 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">ชื่อ Live <span className="text-red-500">*</span></label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} placeholder="เช่น บทที่ 5: การใช้ Excel ขั้นสูง" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">คอร์ส (ถ้ามี)</label>
                <select value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })} className={inputCls}>
                  <option value="">— ทุกนักเรียน —</option>
                  {courses.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">ลิงก์ห้องเรียน (Zoom / Meet)</label>
                <input value={form.meetLink} onChange={(e) => setForm({ ...form, meetLink: e.target.value })} className={inputCls} placeholder="https://meet.google.com/xxx" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">วันที่และเวลา <span className="text-red-500">*</span></label>
                  <input type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">ระยะเวลา (นาที)</label>
                  <input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} min={15} className={inputCls} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">คำอธิบาย</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className={`${inputCls} resize-none`} placeholder="หัวข้อที่จะสอนในคาบนี้..." />
              </div>
            </div>
            <div className="flex gap-3 px-6 py-5 border-t border-gray-100 shrink-0">
              <button onClick={handleCreate} disabled={saving || !form.title || !form.scheduledAt}
                className="flex-1 py-2.5 theme-button font-semibold rounded-xl disabled:opacity-50 text-sm">
                {saving ? "กำลังสร้าง..." : "สร้าง Live"}
              </button>
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 text-sm">ยกเลิก</button>
            </div>
          </div>
        </div>
      )}

      {/* Replay link modal */}
      {editReplay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
            <h2 className="font-bold text-gray-900 mb-4">ใส่ลิงก์ Replay</h2>
            <input value={editReplay.link} onChange={(e) => setEditReplay({ ...editReplay, link: e.target.value })}
              className={inputCls} placeholder="https://youtube.com/watch?v=..." />
            <div className="flex gap-3 mt-4">
              <button onClick={saveReplay} className="flex-1 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl text-sm hover:bg-indigo-700">บันทึก</button>
              <button onClick={() => setEditReplay(null)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl text-sm">ยกเลิก</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
