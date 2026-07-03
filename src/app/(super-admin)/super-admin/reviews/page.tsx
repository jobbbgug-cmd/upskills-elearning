"use client";
import { useState, useEffect, useCallback } from "react";
import { Star, CheckCircle2, XCircle, Trash2, Building2 } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

interface Review {
  _id: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: string;
  institutionId?: { name: string; slug: string } | null;
  studentId?:     { name: string } | null;
  courseId?:      { title: string } | null;
}

const STARS = [1, 2, 3, 4, 5];

export default function SuperAdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState<"pending" | "approved" | "all">("pending");
  const [working, setWorking] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const qs = tab === "all" ? "" : `?status=${tab}`;
    const r = await fetch(`/api/super-admin/reviews${qs}`);
    const d = await r.json();
    setReviews(Array.isArray(d) ? d : []);
    setLoading(false);
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  const approve = async (id: string, val: boolean) => {
    setWorking(id);
    await fetch(`/api/super-admin/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isApproved: val }),
    });
    setReviews((prev) => prev.map((r) => r._id === id ? { ...r, isApproved: val } : r));
    setWorking(null);
  };

  const remove = async (id: string) => {
    if (!confirm("ลบรีวิวนี้?")) return;
    setWorking(id);
    await fetch(`/api/super-admin/reviews/${id}`, { method: "DELETE" });
    setReviews((prev) => prev.filter((r) => r._id !== id));
    setWorking(null);
  };

  const pendingCount  = reviews.filter((r) => !r.isApproved).length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">รีวิวคอร์ส (Platform-wide)</h1>
        <p className="text-gray-500 text-sm mt-1">อนุมัติและจัดการรีวิวทุกสถาบันบนแพลตฟอร์ม</p>
      </div>

      <div className="flex gap-2 mb-5">
        {(["pending", "approved", "all"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === t ? "text-white theme-button" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"}`}>
            {t === "pending" ? "รอการอนุมัติ" : t === "approved" ? "อนุมัติแล้ว" : "ทั้งหมด"}
            {t === "pending" && pendingCount > 0 && tab !== "pending" && (
              <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner />
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
                <div className="w-9 h-9 rounded-full font-bold text-sm flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(var(--color-primary-rgb), 0.1) !important', color: 'var(--color-primary) !important' } as any}>
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
                      ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">เผยแพร่แล้ว</span>
                      : <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">รอการอนุมัติ</span>
                    }
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400 flex-wrap">
                    {r.courseId?.title && <span>{r.courseId.title}</span>}
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-violet-400" />
                      {r.institutionId?.name ?? "—"}
                    </span>
                    <span>{new Date(r.createdAt).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}</span>
                  </div>
                  {r.comment && <p className="text-sm text-gray-700 mt-2">{r.comment}</p>}
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
