"use client";
import { useState, useEffect, useCallback } from "react";
import { Star } from "lucide-react";

interface Course { _id: string; title: string; }
interface MyReview { courseId: string; rating: number; comment: string; isApproved: boolean; }

const STARS = [1,2,3,4,5];

export default function StudentReviewsPage() {
  const [courses,  setCourses]  = useState<Course[]>([]);
  const [reviews,  setReviews]  = useState<Record<string, MyReview>>({});
  const [loading,  setLoading]  = useState(true);
  const [form,     setForm]     = useState<Record<string, { rating: number; comment: string }>>({});
  const [saving,   setSaving]   = useState<string | null>(null);
  const [saved,    setSaved]    = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch("/api/learn");
    const d = await r.json();
    const list = (Array.isArray(d) ? d : d.courses ?? []) as { _id?: string; courseId?: { _id: string; title: string } | string; title?: string }[];
    const cs: Course[] = list.map((item) => {
      if (item.courseId && typeof item.courseId === "object") return { _id: item.courseId._id, title: item.courseId.title };
      return { _id: item._id ?? "", title: item.title ?? "" };
    }).filter((c) => c._id);
    setCourses(cs);

    const reviewMap: Record<string, MyReview> = {};
    const formInit: Record<string, { rating: number; comment: string }> = {};
    await Promise.all(cs.map(async (c) => {
      const rv = await fetch(`/api/reviews?courseId=${c._id}`).then((r2) => r2.json()).catch(() => null);
      if (rv?.reviews) {
        const meRes = await fetch("/api/auth/me").then((r2) => r2.json()).catch(() => null);
        const meId  = meRes?.user?._id;
        const mine  = rv.reviews.find((r2: { studentId?: { _id?: string } }) => r2.studentId?._id === meId);
        if (mine) reviewMap[c._id] = { courseId: c._id, rating: mine.rating, comment: mine.comment, isApproved: mine.isApproved };
      }
      formInit[c._id] = { rating: reviewMap[c._id]?.rating ?? 5, comment: reviewMap[c._id]?.comment ?? "" };
    }));
    setReviews(reviewMap);
    setForm(formInit);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const submit = async (courseId: string) => {
    const f = form[courseId];
    if (!f) return;
    setSaving(courseId);
    const r = await fetch("/api/reviews", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, rating: f.rating, comment: f.comment }),
    });
    if (r.ok) {
      const data = await r.json();
      setReviews((prev) => ({ ...prev, [courseId]: { courseId, rating: data.rating, comment: data.comment, isApproved: data.isApproved } }));
      setSaved(courseId); setTimeout(() => setSaved(null), 2500);
    }
    setSaving(null);
  };

  if (loading) return <div className="text-center py-20 text-gray-400">กำลังโหลด...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">รีวิวคอร์สของฉัน</h1>
        <p className="text-sm text-gray-500 mt-0.5">แสดงความคิดเห็นเกี่ยวกับคอร์สที่เรียน</p>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Star className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">ยังไม่มีคอร์สที่ลงทะเบียน</p>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map((c) => {
            const existing = reviews[c._id];
            const f = form[c._id] ?? { rating: 5, comment: "" };
            return (
              <div key={c._id} className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-semibold text-gray-900 text-sm">{c.title}</p>
                  {existing && (
                    existing.isApproved
                      ? <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">เผยแพร่แล้ว</span>
                      : <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-medium">รอการอนุมัติ</span>
                  )}
                </div>

                {/* Star picker */}
                <div className="flex items-center gap-1 mb-3">
                  {STARS.map((s) => (
                    <button key={s} type="button" onClick={() => setForm((prev) => ({ ...prev, [c._id]: { ...f, rating: s } }))}
                      className="transition-transform hover:scale-110">
                      <Star className={`w-7 h-7 ${s <= f.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"}`} />
                    </button>
                  ))}
                  <span className="text-sm text-gray-500 ml-2">{f.rating}/5</span>
                </div>

                <textarea
                  value={f.comment}
                  onChange={(e) => setForm((prev) => ({ ...prev, [c._id]: { ...f, comment: e.target.value } }))}
                  rows={3} placeholder="แชร์ประสบการณ์การเรียนของคุณ..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none mb-3" />

                <div className="flex justify-end">
                  <button onClick={() => submit(c._id)} disabled={saving === c._id}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                    {saving === c._id ? "กำลังส่ง..." : saved === c._id ? "บันทึกแล้ว ✓" : existing ? "อัปเดตรีวิว" : "ส่งรีวิว"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
