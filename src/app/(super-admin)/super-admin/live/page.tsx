"use client";
import { useState, useEffect } from "react";
import { Radio, Building2, ExternalLink } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

interface Session {
  _id: string;
  title: string;
  status: "upcoming" | "live" | "ended";
  scheduledAt: string;
  duration: number;
  meetLink?: string;
  replayLink?: string;
  institutionId?: { name: string; slug: string } | null;
  courseId?:      { title: string } | null;
  createdBy?:     { name: string } | null;
}

const STATUS_STYLE: Record<string, string> = {
  live:     "bg-red-100 text-red-700 border border-red-200",
  upcoming: "bg-blue-50 text-blue-700 border border-blue-200",
  ended:    "bg-gray-100 text-gray-500 border border-gray-200",
};
const STATUS_TH: Record<string, string> = { live: "LIVE", upcoming: "กำลังจะมา", ended: "จบแล้ว" };

export default function SuperAdminLivePage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState<"all" | "live" | "upcoming" | "ended">("all");

  useEffect(() => {
    setLoading(true);
    const qs = tab === "all" ? "" : `?status=${tab}`;
    fetch(`/api/super-admin/live${qs}`)
      .then((r) => r.json())
      .then((d) => setSessions(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, [tab]);

  const liveCount = sessions.filter((s) => s.status === "live").length;

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            Live Sessions
            {liveCount > 0 && (
              <span className="animate-pulse flex items-center gap-1 text-sm font-semibold bg-red-100 text-red-700 px-3 py-1 rounded-full">
                <span className="w-2 h-2 bg-red-500 rounded-full inline-block" />
                {liveCount} กำลัง LIVE
              </span>
            )}
          </h1>
          <p className="text-gray-500 text-sm mt-1">Live sessions ทุกสถาบันบนแพลตฟอร์ม</p>
        </div>
      </div>

      <div className="flex gap-2 mb-5">
        {(["all", "live", "upcoming", "ended"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === t ? "text-white theme-button" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"}`}>
            {t === "all" ? "ทั้งหมด" : STATUS_TH[t]}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : sessions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <Radio className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">ไม่มี Session</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {sessions.map((s) => (
            <div key={s._id} className={`bg-white rounded-2xl border p-5 ${s.status === "live" ? "border-red-200 shadow-sm shadow-red-50" : "border-gray-100"}`}>
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.status === "live" ? "bg-red-50" : s.status === "upcoming" ? "bg-blue-50" : "bg-gray-50"}`}>
                  <Radio className={`w-5 h-5 ${s.status === "live" ? "text-red-500" : s.status === "upcoming" ? "text-blue-500" : "text-gray-400"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900 text-sm">{s.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_STYLE[s.status]}`}>
                      {s.status === "live" ? "● LIVE" : STATUS_TH[s.status]}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-violet-400" />
                      {s.institutionId?.name ?? "—"}
                    </span>
                    {s.courseId?.title && <span>{s.courseId.title}</span>}
                    {s.createdBy?.name && <span>สร้างโดย {s.createdBy.name}</span>}
                    <span>{new Date(s.scheduledAt).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                    <span>{s.duration} นาที</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {s.meetLink && s.status !== "ended" && (
                    <a href={s.meetLink} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 font-medium transition-colors">
                      <ExternalLink className="w-3.5 h-3.5" /> Join
                    </a>
                  )}
                  {s.replayLink && (
                    <a href={s.replayLink} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 font-medium transition-colors">
                      <ExternalLink className="w-3.5 h-3.5" /> Replay
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
