"use client";
import { useState, useEffect, useCallback } from "react";
import { Star, CheckCircle2, XCircle, Trash2 } from "lucide-react";

interface Review {
  _id: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: string;
  studentId?: { name: string; profileImage?: string } | null;
  courseId?:  { title: string } | null;
}

const STARS = [1,2,3,4,5];

export default function AdminReviewsPage() {
  const [reviews,  setReviews]  = useState<Review[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState<"pending" | "approved" | "all">("pending");
  const [working,  setWorking]  = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch(`/api/admin/reviews?status=${tab === "all" ? "" : tab}`);
    const data = await r.json();
    setReviews(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  const approve = async (id: string, val: boolean) => {
    setWorking(id);
    await fetch(`/api/admin/reviews/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isApproved: val }) });
    await load();
    setWorking(null);
  };

  const remove = async (id: string) => {
    if (!confirm("ลบรีวิวนี้?")) return;
    setWorking(id);
    await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
    setReviews((prev) => prev.filter((r) => r._id !== id));
    setWorking(null);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">รีวิวคอร์ส</h1>
        <p className="text-gray-500 text-sm mt-1">อนุมัติและจัดการรีวิวจากผู้เรียน</p>
      </div>

      <div className="flex gap-2 mb-5">
        {(["pending","approved","all"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === t ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-indigo-300"}`}>
            {t === "pending" ? "รอการอนุมัติ" : t === "approved" ? "อนุมัติแล้ว" : "ทั้งหมด"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">กำลังโหลด...</div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <Star className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">ไม่มีรีวิว</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r._id} className={`bg-white rounded-2xl border p-5 ${r.isApproved ? "border-green-100" : "border-amber-100"}`}>
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-600 shrink-0">
                  {(r.studentId?.name ?? "?")[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900 text-sm">{r.studentId?.name ?? "—"}</span>
                    <div className="flex">
                      {STARS.map((s) => (
                        <Star key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"}`} />
                      ))}
                    </div>
                    {r.isApproved
                      ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">อนุมัติแล้ว</span>
                      : <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">รอการอนุมัติ</span>
                    }
                  </div>
                  {r.courseId?.title && (
                    <p className="text-xs text-indigo-500 mt-0.5">{r.courseId.title}</p>
                  )}
                  {r.comment && <p className="text-sm text-gray-700 mt-2">{r.comment}</p>}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(r.createdAt).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!r.isApproved ? (
                    <button onClick={() => approve(r._id, true)} disabled={working === r._id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 text-xs font-semibold rounded-xl hover:bg-green-100 disabled:opacity-50 transition-colors">
                      <CheckCircle2 className="w-3.5 h-3.5" /> อนุมัติ
                    </button>
                  ) : (
                    <button onClick={() => approve(r._id, false)} disabled={working === r._id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-600 text-xs font-semibold rounded-xl hover:bg-gray-100 disabled:opacity-50 transition-colors">
                      <XCircle className="w-3.5 h-3.5" /> ยกเลิก
                    </button>
                  )}
                  <button onClick={() => remove(r._id)} disabled={working === r._id}
                    className="p-1.5 text-gray-300 hover:text-red-500 rounded-xl transition-colors disabled:opacity-50">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
