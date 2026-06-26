"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { MessageSquare, Plus, Pin, CheckCircle2, ThumbsUp, ChevronRight } from "lucide-react";

interface ForumPost {
  _id: string;
  title: string;
  isPinned: boolean;
  isResolved: boolean;
  upvoteCount: number;
  replyCount: number;
  createdAt: string;
  authorId?: { name: string } | null;
  courseId?:  { _id: string; title: string } | null;
}

interface Course { _id: string; title: string; }

export default function StudentForumPage() {
  const [posts,     setPosts]    = useState<ForumPost[]>([]);
  const [courses,   setCourses]  = useState<Course[]>([]);
  const [courseId,  setCourseId] = useState("");
  const [loading,   setLoading]  = useState(true);
  const [showForm,  setShowForm] = useState(false);
  const [form,      setForm]     = useState({ courseId: "", title: "", body: "" });
  const [submitting, setSub]     = useState(false);

  useEffect(() => {
    fetch("/api/learn")
      .then((r) => r.json())
      .then((d) => {
        const list = (Array.isArray(d) ? d : d.courses ?? []) as { _id?: string; courseId?: { _id: string; title: string } | string; title?: string }[];
        const cs: Course[] = list.map((item) => {
          if (item.courseId && typeof item.courseId === "object") return { _id: item.courseId._id, title: item.courseId.title };
          return { _id: item._id ?? "", title: item.title ?? "" };
        }).filter((c) => c._id);
        setCourses(cs);
      }).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const qs = courseId ? `?courseId=${courseId}` : "";
    fetch(`/api/forum${qs}`)
      .then((r) => r.json())
      .then((d) => setPosts(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, [courseId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSub(true);
    const r = await fetch("/api/forum", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (r.ok) {
      const post = await r.json();
      setPosts((prev) => [{ ...post, upvoteCount: 0, replyCount: 0 }, ...prev]);
      setShowForm(false); setForm({ courseId: "", title: "", body: "" });
    } else { const e2 = await r.json(); alert(e2.error ?? "เกิดข้อผิดพลาด"); }
    setSub(false);
  };

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">กระดานถามตอบ</h1>
          <p className="text-sm text-gray-500 mt-0.5">ถาม–ตอบกับเพื่อนและครูผู้สอน</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors">
          <Plus className="w-4 h-4" /> ตั้งกระทู้ใหม่
        </button>
      </div>

      {/* Course filter */}
      {courses.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
          <button onClick={() => setCourseId("")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors shrink-0 ${!courseId ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-indigo-300"}`}>
            ทั้งหมด
          </button>
          {courses.map((c) => (
            <button key={c._id} onClick={() => setCourseId(c._id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors shrink-0 ${courseId === c._id ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-indigo-300"}`}>
              {c.title}
            </button>
          ))}
        </div>
      )}

      {/* New post modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <h2 className="font-bold text-gray-900 text-lg mb-5">ตั้งกระทู้ใหม่</h2>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">คอร์ส</label>
                <select value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })} required className={inputCls}>
                  <option value="">เลือกคอร์ส</option>
                  {courses.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">หัวข้อกระทู้</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className={inputCls} placeholder="ระบุหัวข้อ..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">รายละเอียด</label>
                <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} required rows={4} className={`${inputCls} resize-none`} placeholder="อธิบายปัญหาหรือคำถาม..." />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">ยกเลิก</button>
                <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50">
                  {submitting ? "กำลังโพสต์..." : "โพสต์กระทู้"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-gray-400">กำลังโหลด...</div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <MessageSquare className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">ยังไม่มีกระทู้</p>
          <p className="text-gray-300 text-xs mt-1">เป็นคนแรกที่ตั้งกระทู้!</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {posts.map((p) => (
            <Link key={p._id} href={`/dashboard/forum/${p._id}`}
              className={`block bg-white rounded-2xl border p-4 hover:shadow-sm transition-all ${p.isPinned ? "border-indigo-200" : "border-gray-100 hover:border-indigo-200"}`}>
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${p.isResolved ? "bg-green-50" : "bg-indigo-50"}`}>
                  {p.isResolved ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <MessageSquare className="w-4 h-4 text-indigo-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {p.isPinned && <Pin className="w-3 h-3 text-indigo-400" />}
                    <span className="font-semibold text-gray-900 text-sm">{p.title}</span>
                    {p.isResolved && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">แก้ไขแล้ว</span>}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                    <span>{p.authorId?.name ?? "—"}</span>
                    {p.courseId?.title && <span className="text-indigo-400">{p.courseId.title}</span>}
                    <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{p.upvoteCount}</span>
                    <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{p.replyCount}</span>
                    <span>{new Date(p.createdAt).toLocaleDateString("th-TH")}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 shrink-0 mt-1" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
