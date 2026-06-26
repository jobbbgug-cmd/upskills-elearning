"use client";
import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { MessageSquare, ThumbsUp, CheckCircle2, Pin, ArrowLeft, Send } from "lucide-react";

interface Author { name: string; profileImage?: string; role?: string; }
interface Post {
  _id: string; title: string; body: string; isPinned: boolean; isResolved: boolean;
  upvotes: string[]; createdAt: string;
  authorId?: Author | null; courseId?: { title: string } | null;
}
interface Reply {
  _id: string; body: string; upvotes: string[]; createdAt: string;
  authorId?: Author | null;
}

const ROLE_BADGE: Record<string, string> = {
  teacher: "bg-green-100 text-green-700",
  admin:   "bg-purple-100 text-purple-700",
  super_admin: "bg-rose-100 text-rose-700",
};
const ROLE_LABEL: Record<string, string> = { teacher: "ครู", admin: "Admin", super_admin: "Super Admin", student: "นักเรียน" };

function Avatar({ author, size = "sm" }: { author?: Author | null; size?: "sm" | "md" }) {
  const s = size === "md" ? "w-10 h-10 text-sm" : "w-8 h-8 text-xs";
  return (
    <div className={`${s} rounded-full bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center shrink-0 overflow-hidden`}>
      {author?.name?.[0]?.toUpperCase() ?? "?"}
    </div>
  );
}

export default function ForumPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [post,     setPost]     = useState<Post | null>(null);
  const [replies,  setReplies]  = useState<Reply[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [me,       setMe]       = useState<string>("");
  const [replyTxt, setReplyTxt] = useState("");
  const [sending,  setSending]  = useState(false);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setMe(d.user?._id ?? ""));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch(`/api/forum/${id}`);
    if (r.ok) {
      const d = await r.json();
      setPost(d.post);
      setReplies(d.replies ?? []);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const upvote = async () => {
    const r = await fetch(`/api/forum/${id}/upvote`, { method: "PATCH" });
    if (r.ok) {
      const d = await r.json();
      setPost((prev) => {
        if (!prev) return prev;
        const upvotes = d.upvoted ? [...prev.upvotes, me] : prev.upvotes.filter((u) => u !== me);
        return { ...prev, upvotes };
      });
    }
  };

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyTxt.trim()) return;
    setSending(true);
    const r = await fetch(`/api/forum/${id}/replies`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body: replyTxt }) });
    if (r.ok) {
      const reply = await r.json();
      setReplies((prev) => [...prev, reply]);
      setReplyTxt("");
    }
    setSending(false);
  };

  const markResolved = async () => {
    const r = await fetch(`/api/forum/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isResolved: !post?.isResolved }) });
    if (r.ok) { const d = await r.json(); setPost((prev) => prev ? { ...prev, isResolved: d.isResolved } : prev); }
  };

  if (loading) return <div className="text-center py-20 text-gray-400">กำลังโหลด...</div>;
  if (!post)   return <div className="text-center py-20 text-gray-400">ไม่พบกระทู้</div>;

  const hasUpvoted = post.upvotes.includes(me);
  const isAuthor   = post.authorId && typeof post.authorId === "object" && (post.authorId as unknown as { _id?: string })._id === me;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link href="/dashboard/forum" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> กลับกระดานถามตอบ
      </Link>

      {/* Post */}
      <div className={`bg-white rounded-2xl border p-6 mb-6 ${post.isPinned ? "border-indigo-200" : "border-gray-100"}`}>
        <div className="flex items-start gap-3 mb-4">
          <Avatar author={post.authorId} size="md" />
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm text-gray-900">{post.authorId?.name ?? "—"}</span>
              {post.authorId?.role && ROLE_BADGE[post.authorId.role] && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_BADGE[post.authorId.role]}`}>
                  {ROLE_LABEL[post.authorId.role]}
                </span>
              )}
              {post.courseId?.title && <span className="text-xs text-indigo-500">{post.courseId.title}</span>}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">{new Date(post.createdAt).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}</p>
          </div>
          {post.isPinned && <Pin className="w-4 h-4 text-indigo-400 shrink-0" />}
        </div>

        <div className="flex items-center gap-2 mb-3">
          {post.isResolved && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />}
          <h1 className="text-lg font-bold text-gray-900">{post.title}</h1>
        </div>
        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{post.body}</p>

        <div className="flex items-center gap-3 mt-5 pt-4 border-t border-gray-100">
          <button onClick={upvote}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${hasUpvoted ? "bg-indigo-100 text-indigo-700" : "bg-gray-50 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600"}`}>
            <ThumbsUp className="w-3.5 h-3.5" /> {post.upvotes.length} ถูกใจ
          </button>
          {isAuthor && (
            <button onClick={markResolved}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${post.isResolved ? "bg-green-100 text-green-700" : "bg-gray-50 text-gray-500 hover:bg-green-50 hover:text-green-600"}`}>
              <CheckCircle2 className="w-3.5 h-3.5" /> {post.isResolved ? "แก้ไขแล้ว" : "ทำเครื่องหมายแก้ไขแล้ว"}
            </button>
          )}
          <span className="text-xs text-gray-400 ml-auto"><MessageSquare className="w-3.5 h-3.5 inline mr-1" />{replies.length} ตอบ</span>
        </div>
      </div>

      {/* Replies */}
      {replies.length > 0 && (
        <div className="space-y-3 mb-6">
          {replies.map((r) => {
            const rAuthor = r.authorId;
            return (
              <div key={r._id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-start gap-3">
                <Avatar author={rAuthor} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-gray-900">{rAuthor?.name ?? "—"}</span>
                    {rAuthor?.role && ROLE_BADGE[rAuthor.role] && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_BADGE[rAuthor.role]}`}>
                        {ROLE_LABEL[rAuthor.role]}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(r.createdAt).toLocaleDateString("th-TH")}</p>
                  <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{r.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reply form */}
      <form onSubmit={sendReply} className="bg-white rounded-2xl border border-gray-100 p-4">
        <p className="text-sm font-semibold text-gray-700 mb-3">ตอบกระทู้</p>
        <textarea value={replyTxt} onChange={(e) => setReplyTxt(e.target.value)} rows={3}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none mb-3"
          placeholder="พิมพ์คำตอบ..." />
        <div className="flex justify-end">
          <button type="submit" disabled={sending || !replyTxt.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors">
            <Send className="w-3.5 h-3.5" /> {sending ? "กำลังส่ง..." : "ส่งคำตอบ"}
          </button>
        </div>
      </form>
    </div>
  );
}
