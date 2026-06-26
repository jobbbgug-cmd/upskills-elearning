"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { MessageSquare, Pin, CheckCircle2, Trash2, ChevronRight, ThumbsUp } from "lucide-react";

interface ForumPost {
  _id: string;
  title: string;
  body: string;
  isPinned: boolean;
  isResolved: boolean;
  upvoteCount: number;
  replyCount: number;
  createdAt: string;
  authorId?: { name: string } | null;
  courseId?:  { title: string } | null;
}

export default function AdminForumPage() {
  const [posts,   setPosts]   = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch("/api/forum");
    const d = await r.json();
    setPosts(Array.isArray(d) ? d : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const setPin = async (id: string, val: boolean) => {
    setWorking(id);
    await fetch(`/api/forum/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isPinned: val }) });
    setPosts((prev) => prev.map((p) => p._id === id ? { ...p, isPinned: val } : p));
    setWorking(null);
  };

  const setResolve = async (id: string, val: boolean) => {
    setWorking(id);
    await fetch(`/api/forum/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isResolved: val }) });
    setPosts((prev) => prev.map((p) => p._id === id ? { ...p, isResolved: val } : p));
    setWorking(null);
  };

  const remove = async (id: string) => {
    if (!confirm("ลบกระทู้นี้?")) return;
    setWorking(id);
    await fetch(`/api/forum/${id}`, { method: "DELETE" });
    setPosts((prev) => prev.filter((p) => p._id !== id));
    setWorking(null);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Forum / กระดานถามตอบ</h1>
        <p className="text-gray-500 text-sm mt-1">จัดการกระทู้ทั้งหมดในระบบ</p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">กำลังโหลด...</div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <MessageSquare className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">ยังไม่มีกระทู้</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {posts.map((p) => (
            <div key={p._id} className={`bg-white rounded-2xl border p-4 flex items-start gap-4 ${p.isPinned ? "border-indigo-200 bg-indigo-50/30" : "border-gray-100"}`}>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                <MessageSquare className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {p.isPinned   && <Pin className="w-3.5 h-3.5 text-indigo-500" />}
                  {p.isResolved && <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
                  <span className="font-semibold text-gray-900 text-sm">{p.title}</span>
                </div>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400 flex-wrap">
                  <span>{p.authorId?.name ?? "—"}</span>
                  {p.courseId?.title && <span className="text-indigo-500">{p.courseId.title}</span>}
                  <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{p.upvoteCount}</span>
                  <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{p.replyCount} ตอบ</span>
                  <span>{new Date(p.createdAt).toLocaleDateString("th-TH")}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button onClick={() => setPin(p._id, !p.isPinned)} disabled={working === p._id}
                  className={`p-1.5 rounded-xl text-xs transition-colors disabled:opacity-50 ${p.isPinned ? "bg-indigo-100 text-indigo-600" : "text-gray-300 hover:text-indigo-500"}`}
                  title={p.isPinned ? "ยกเลิก Pin" : "Pin กระทู้"}>
                  <Pin className="w-4 h-4" />
                </button>
                <button onClick={() => setResolve(p._id, !p.isResolved)} disabled={working === p._id}
                  className={`p-1.5 rounded-xl text-xs transition-colors disabled:opacity-50 ${p.isResolved ? "bg-green-100 text-green-600" : "text-gray-300 hover:text-green-500"}`}
                  title={p.isResolved ? "ยกเลิก Resolve" : "Mark Resolved"}>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
                <button onClick={() => remove(p._id)} disabled={working === p._id}
                  className="p-1.5 text-gray-300 hover:text-red-500 rounded-xl transition-colors disabled:opacity-50">
                  <Trash2 className="w-4 h-4" />
                </button>
                <Link href={`/dashboard/forum/${p._id}`}
                  className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-xl transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
