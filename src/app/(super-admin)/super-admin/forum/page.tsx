"use client";
import { useState, useEffect, useCallback } from "react";
import { MessageSquare, Pin, CheckCircle2, Trash2, ThumbsUp, Building2 } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

interface Post {
  _id: string;
  title: string;
  isPinned: boolean;
  isResolved: boolean;
  upvoteCount: number;
  replyCount: number;
  createdAt: string;
  institutionId?: { name: string; slug: string } | null;
  authorId?:      { name: string; role?: string } | null;
  courseId?:      { title: string } | null;
}

export default function SuperAdminForumPage() {
  const [posts,   setPosts]   = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState<string | null>(null);
  const [search,  setSearch]  = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch("/api/super-admin/forum");
    const d = await r.json();
    setPosts(Array.isArray(d) ? d : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const patch = async (id: string, body: Record<string, unknown>) => {
    setWorking(id);
    const r = await fetch(`/api/super-admin/forum/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (r.ok) {
      const updated = await r.json();
      setPosts((prev) => prev.map((p) => p._id === id ? { ...p, ...updated } : p));
    }
    setWorking(null);
  };

  const remove = async (id: string) => {
    if (!confirm("ลบกระทู้นี้? (replies ทั้งหมดจะถูกลบด้วย)")) return;
    setWorking(id);
    await fetch(`/api/super-admin/forum/${id}`, { method: "DELETE" });
    setPosts((prev) => prev.filter((p) => p._id !== id));
    setWorking(null);
  };

  const filtered = posts.filter((p) =>
    !search ||
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    (p.institutionId?.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (p.authorId?.name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Forum (Platform-wide)</h1>
          <p className="text-gray-500 text-sm mt-1">กระดานถามตอบทุกสถาบัน — {posts.length} กระทู้</p>
        </div>
        <input
          value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="ค้นหากระทู้ / สถาบัน / ผู้โพสต์..."
          className="w-64 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
        />
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <MessageSquare className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">{search ? "ไม่พบกระทู้ที่ค้นหา" : "ยังไม่มีกระทู้"}</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((p) => (
            <div key={p._id}
              className={`bg-white rounded-2xl border p-4 flex items-start gap-4 ${p.isPinned ? "border-violet-200 bg-violet-50/20" : "border-gray-100"}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${p.isResolved ? "bg-green-50" : p.isPinned ? "bg-violet-50" : "bg-indigo-50"}`}>
                {p.isResolved
                  ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                  : <MessageSquare className={`w-4 h-4 ${p.isPinned ? "text-violet-500" : "text-indigo-400"}`} />
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {p.isPinned   && <Pin className="w-3 h-3 text-violet-500" />}
                  <span className="font-semibold text-gray-900 text-sm">{p.title}</span>
                  {p.isResolved && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">แก้ไขแล้ว</span>}
                </div>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-violet-400" />
                    {p.institutionId?.name ?? "—"}
                  </span>
                  {p.courseId?.title && <span>{p.courseId.title}</span>}
                  <span>{p.authorId?.name ?? "—"}</span>
                  <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{p.upvoteCount}</span>
                  <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{p.replyCount} ตอบ</span>
                  <span>{new Date(p.createdAt).toLocaleDateString("th-TH")}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => patch(p._id, { isPinned: !p.isPinned })}
                  disabled={working === p._id}
                  title={p.isPinned ? "ยกเลิก Pin" : "Pin กระทู้"}
                  className={`p-1.5 rounded-xl transition-colors disabled:opacity-50 ${p.isPinned ? "bg-violet-100 text-violet-600" : "text-gray-300 hover:text-violet-500"}`}>
                  <Pin className="w-4 h-4" />
                </button>
                <button
                  onClick={() => patch(p._id, { isResolved: !p.isResolved })}
                  disabled={working === p._id}
                  title={p.isResolved ? "ยกเลิก Resolve" : "Mark Resolved"}
                  className={`p-1.5 rounded-xl transition-colors disabled:opacity-50 ${p.isResolved ? "bg-green-100 text-green-600" : "text-gray-300 hover:text-green-500"}`}>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => remove(p._id)}
                  disabled={working === p._id}
                  className="p-1.5 text-gray-300 hover:text-red-500 rounded-xl transition-colors disabled:opacity-50">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
