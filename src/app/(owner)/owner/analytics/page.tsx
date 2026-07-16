"use client";
import { useState, useEffect } from "react";
import { BookOpen, Video, FileText, PenLine, ClipboardCheck, Users, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

interface CourseData {
  _id: string; title: string; isActive: boolean;
  enrolled: number; watchingRate: number;
  hwCount: number; hwSubmitted: number; hwGraded: number; hwAvgScore: number | null;
  quizCount: number; quizAttempts: number; quizAvgPct: number | null;
  attendance: number;
}
interface Analytics { totalStudents: number; courses: CourseData[]; }

function Bar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${Math.min(100, pct)}%` }} />
      </div>
      <span className="text-xs text-gray-500 w-8 text-right">{pct}%</span>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="text-center">
      <p className="text-xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-indigo-500 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function AnalyticsPage() {
  const [data,      setData]      = useState<Analytics | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [expanded,  setExpanded]  = useState<Set<string>>(new Set());
  const [sortBy,    setSortBy]    = useState<"enrolled" | "watchingRate" | "hwSubmitted" | "quizAttempts">("enrolled");

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); });
  }, []);

  const toggleExpand = (id: string) => setExpanded((prev) => {
    const s = new Set(prev);
    if (s.has(id)) s.delete(id); else s.add(id);
    return s;
  });

  if (loading) return <LoadingSpinner />;
  if (!data) return null;

  const sorted = [...data.courses].sort((a, b) => (b[sortBy] ?? 0) - (a[sortBy] ?? 0));

  const totalEnrolled   = data.courses.reduce((s, c) => s + c.enrolled, 0);
  const totalHwSub      = data.courses.reduce((s, c) => s + c.hwSubmitted, 0);
  const totalQuizAttempts = data.courses.reduce((s, c) => s + c.quizAttempts, 0);
  const totalAttendance = data.courses.reduce((s, c) => s + c.attendance, 0);
  const avgWatching     = data.courses.length > 0
    ? Math.round(data.courses.reduce((s, c) => s + c.watchingRate, 0) / data.courses.length)
    : 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">สถิติการเรียนรายคอร์ส</p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {[
          { icon: <Users className="w-5 h-5 text-indigo-600" />, border: "border-l-indigo-500", label: "นักเรียน", value: data.totalStudents },
          { icon: <BookOpen className="w-5 h-5 text-amber-600" />, border: "border-l-amber-500", label: "การลงทะเบียน", value: totalEnrolled },
          { icon: <Video className="w-5 h-5 text-violet-600" />, border: "border-l-violet-500", label: "เฉลี่ยดูคลิป", value: `${avgWatching}%` },
          { icon: <FileText className="w-5 h-5 text-green-600" />, border: "border-l-green-500", label: "ส่งการบ้าน", value: totalHwSub },
          { icon: <PenLine className="w-5 h-5 text-rose-600" />, border: "border-l-rose-500", label: "ทำข้อสอบ", value: totalQuizAttempts },
        ].map((item, i) => (
          <div key={i} className={`bg-white rounded-2xl border border-gray-100 border-l-4 ${item.border} p-5`}>
            <div className="flex items-center gap-3 mb-2">
              {item.icon}
              <p className="text-2xl font-bold text-gray-900">{item.value}</p>
            </div>
            <p className="text-xs text-gray-500">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Sort tabs */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="text-xs text-gray-400 font-medium">เรียงตาม:</span>
        {(["enrolled", "watchingRate", "hwSubmitted", "quizAttempts"] as const).map((key) => {
          const labels: Record<string, string> = { enrolled: "จำนวนนักเรียน", watchingRate: "% ดูคลิป", hwSubmitted: "ส่งการบ้าน", quizAttempts: "ทำข้อสอบ" };
          const colorClass: Record<string, string> = { enrolled: "sort-enrolled", watchingRate: "sort-watching", hwSubmitted: "sort-homework", quizAttempts: "sort-quiz" };
          return (
            <button key={key} onClick={() => setSortBy(key)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${sortBy === key ? colorClass[key] : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"}`}>
              {labels[key]}
            </button>
          );
        })}
      </div>

      {/* Course list */}
      <div className="space-y-3">
        {sorted.map((c) => {
          const open = expanded.has(c._id);
          return (
            <div key={c._id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <button onClick={() => toggleExpand(c._id)} className="w-full flex items-center gap-4 p-5 text-left hover:bg-gray-50 transition-colors">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${c.isActive ? "bg-indigo-50" : "bg-gray-100"}`}>
                  <BookOpen className={`w-5 h-5 ${c.isActive ? "text-indigo-500" : "text-gray-300"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-semibold text-gray-900 truncate">{c.title}</p>
                    {!c.isActive && <span className="shrink-0 text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">ปิด</span>}
                  </div>
                  {/* Mini stats row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <p className="text-xs text-gray-400 mb-1 flex items-center gap-1"><Users className="w-3 h-3" /> {c.enrolled} คน</p>
                      <Bar pct={c.enrolled > 0 ? 100 : 0} color="bg-indigo-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1 flex items-center gap-1"><Video className="w-3 h-3" /> ดูคลิป</p>
                      <Bar pct={c.watchingRate} color="bg-violet-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1 flex items-center gap-1"><FileText className="w-3 h-3" /> การบ้าน {c.hwSubmitted}/{c.hwCount > 0 ? `${c.hwCount} ชิ้น` : "—"}</p>
                      <Bar pct={c.hwCount > 0 ? Math.round((c.hwSubmitted / (c.enrolled * Math.max(c.hwCount, 1))) * 100) : 0} color="bg-amber-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1 flex items-center gap-1"><PenLine className="w-3 h-3" /> สอบ {c.quizAttempts} ครั้ง</p>
                      <Bar pct={c.quizAvgPct ?? 0} color="bg-rose-400" />
                    </div>
                  </div>
                </div>
                <div className="shrink-0 text-gray-300">
                  {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {open && (
                <div className="border-t border-gray-50 px-5 py-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <Video className="w-3.5 h-3.5 text-violet-500" /> คลิปการสอน
                      </p>
                      <Stat label="นักเรียนที่ดูคลิป" value={`${c.watchingRate}%`} sub={`จาก ${c.enrolled} คน`} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-amber-500" /> การบ้าน
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <Stat label="ส่งแล้ว" value={c.hwSubmitted} />
                        <Stat label="ตรวจแล้ว" value={c.hwGraded} />
                        {c.hwAvgScore !== null && <Stat label="คะแนนเฉลี่ย" value={c.hwAvgScore} sub="คะแนน" />}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <PenLine className="w-3.5 h-3.5 text-rose-500" /> ข้อสอบ
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <Stat label="ทำทั้งหมด" value={c.quizAttempts} sub="ครั้ง" />
                        {c.quizAvgPct !== null && <Stat label="คะแนนเฉลี่ย" value={`${c.quizAvgPct}%`} />}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <ClipboardCheck className="w-3.5 h-3.5 text-green-500" /> การเข้าเรียน
                      </p>
                      <Stat label="บันทึกเช็คชื่อ" value={c.attendance} sub="ครั้ง" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {sorted.length === 0 && (
        <div className="text-center py-20 text-gray-300">
          <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">ยังไม่มีคอร์ส</p>
        </div>
      )}
    </div>
  );
}
