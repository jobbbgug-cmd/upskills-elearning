"use client";
import { useEffect, useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, GraduationCap, Clock, Users, Video, X } from "lucide-react";

interface TeachingSession {
  courseId: string; courseTitle: string; instructor: string; coverImage: string;
  sessionId: string; date: string; startTime: string; endTime: string;
  zoomLink: string; confirmedStudents: number; maxCapacity: number;
}

const MONTHS_TH = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
const DAYS_SHORT = ["อา","จ","อ","พ","พฤ","ศ","ส"];

const COLORS = [
  { pill: "bg-indigo-100 text-indigo-700", card: "bg-indigo-50 border-indigo-200", text: "text-indigo-700", dot: "bg-indigo-400" },
  { pill: "bg-violet-100 text-violet-700", card: "bg-violet-50 border-violet-200", text: "text-violet-700", dot: "bg-violet-400" },
  { pill: "bg-emerald-100 text-emerald-700", card: "bg-emerald-50 border-emerald-200", text: "text-emerald-700", dot: "bg-emerald-400" },
  { pill: "bg-amber-100 text-amber-700", card: "bg-amber-50 border-amber-200", text: "text-amber-700", dot: "bg-amber-400" },
  { pill: "bg-rose-100 text-rose-700", card: "bg-rose-50 border-rose-200", text: "text-rose-700", dot: "bg-rose-400" },
  { pill: "bg-blue-100 text-blue-700", card: "bg-blue-50 border-blue-200", text: "text-blue-700", dot: "bg-blue-400" },
  { pill: "bg-teal-100 text-teal-700", card: "bg-teal-50 border-teal-200", text: "text-teal-700", dot: "bg-teal-400" },
  { pill: "bg-orange-100 text-orange-700", card: "bg-orange-50 border-orange-200", text: "text-orange-700", dot: "bg-orange-400" },
];

function toDateStr(d: Date) { return d.toISOString().slice(0, 10); }

type Cell = { day: number; month: "prev" | "curr" | "next" };

export default function TeacherSchedulePage() {
  const [events, setEvents] = useState<TeachingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState("all");
  const today = toDateStr(new Date());
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());

  useEffect(() => {
    fetch("/api/schedule/teacher").then(r => r.json())
      .then(d => { setEvents(d.events ?? []); setLoading(false); });
  }, []);

  const teachers = useMemo(() => {
    const s = new Set<string>(); events.forEach(e => s.add(e.instructor));
    return Array.from(s).sort();
  }, [events]);

  const teacherColor = useMemo(() => {
    const m = new Map<string, number>(); teachers.forEach((t, i) => m.set(t, i % COLORS.length));
    return m;
  }, [teachers]);

  const visible = useMemo(() =>
    selectedTeacher === "all" ? events : events.filter(e => e.instructor === selectedTeacher),
  [events, selectedTeacher]);

  const byDate = useMemo(() => {
    const m = new Map<string, TeachingSession[]>();
    for (const e of visible) { if (!m.has(e.date)) m.set(e.date, []); m.get(e.date)!.push(e); }
    return m;
  }, [visible]);

  const calCells = useMemo((): Cell[] => {
    const firstDay = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const prevTotal = new Date(calYear, calMonth, 0).getDate();
    const cells: Cell[] = [];
    for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: prevTotal - i, month: "prev" });
    for (let i = 1; i <= daysInMonth; i++) cells.push({ day: i, month: "curr" });
    let n = 1;
    while (cells.length % 7 !== 0) cells.push({ day: n++, month: "next" });
    return cells;
  }, [calYear, calMonth]);

  function cellDateStr(cell: Cell) {
    let y = calYear, m = calMonth;
    if (cell.month === "prev") { m--; if (m < 0) { m = 11; y--; } }
    if (cell.month === "next") { m++; if (m > 11) { m = 0; y++; } }
    return `${y}-${String(m + 1).padStart(2, "0")}-${String(cell.day).padStart(2, "0")}`;
  }

  function prevMonth() { if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); } else setCalMonth(m => m - 1); }
  function nextMonth() { if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); } else setCalMonth(m => m + 1); }

  const selectedEvents = selectedDate ? (byDate.get(selectedDate) ?? []) : [];

  if (loading) return <div className="text-center py-20 text-gray-400 text-sm">กำลังโหลด...</div>;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ตารางสอน</h1>
          <p className="text-sm text-gray-500 mt-0.5">ตารางการสอนทั้งหมด</p>
        </div>
        {teachers.length > 1 && (
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-gray-400 shrink-0" />
            <select value={selectedTeacher} onChange={e => { setSelectedTeacher(e.target.value); setSelectedDate(null); }}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 min-w-[180px]">
              <option value="all">ครูทั้งหมด ({teachers.length} คน)</option>
              {teachers.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {/* Month nav */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-gray-900">{MONTHS_TH[calMonth]} {calYear + 543}</h2>
            <button onClick={() => { setCalYear(new Date().getFullYear()); setCalMonth(new Date().getMonth()); }}
              className="text-xs px-3 py-1 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors">
              วันนี้
            </button>
          </div>
          <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Day name headers */}
        <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
          {DAYS_SHORT.map((d, i) => (
            <div key={d} className={`py-2.5 text-center text-xs font-semibold uppercase tracking-wide
              ${i === 0 ? "text-rose-400" : i === 6 ? "text-blue-400" : "text-gray-400"}`}>
              {d}
            </div>
          ))}
        </div>

        {/* Grid cells */}
        <div className="grid grid-cols-7 divide-x divide-y divide-gray-100">
          {calCells.map((cell, i) => {
            const dateStr = cellDateStr(cell);
            const isCurr = cell.month === "curr";
            const dayEvs = isCurr ? (byDate.get(dateStr) ?? []) : [];
            const isToday = dateStr === today && isCurr;
            const isSel = selectedDate === dateStr;
            const colIdx = i % 7;
            return (
              <div key={i}
                onClick={() => isCurr && setSelectedDate(isSel ? null : dateStr)}
                className={`min-h-[100px] p-1.5 transition-colors
                  ${!isCurr ? "bg-gray-50/60" : isSel ? "bg-indigo-50" : colIdx === 0 || colIdx === 6 ? "bg-rose-50/20" : "bg-white"}
                  ${isCurr ? "cursor-pointer hover:bg-indigo-50/40" : ""}`}
              >
                <div className={`w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full text-xs font-medium mb-1 ml-auto
                  ${isToday ? "bg-indigo-600 text-white font-bold" : isSel ? "bg-indigo-200 text-indigo-800" : !isCurr ? "text-gray-300" : "text-gray-700"}`}>
                  {cell.day}
                </div>
                <div className="space-y-0.5">
                  {dayEvs.slice(0, 3).map(ev => {
                    const c = COLORS[teacherColor.get(ev.instructor) ?? 0];
                    return (
                      <div key={ev.sessionId} className={`px-1.5 py-0.5 rounded text-xs truncate leading-snug ${c.pill}`}>
                        <span className="font-semibold">{ev.startTime}</span> <span className="hidden sm:inline">{ev.courseTitle}</span>
                      </div>
                    );
                  })}
                  {dayEvs.length > 3 && (
                    <div className="text-xs text-indigo-400 px-1 font-medium">+{dayEvs.length - 3} อื่นๆ</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Teacher legend */}
      {teachers.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {teachers.map((t, i) => {
            const c = COLORS[i % COLORS.length];
            return (
              <button key={t} onClick={() => setSelectedTeacher(selectedTeacher === t ? "all" : t)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border
                  ${selectedTeacher === t ? `${c.pill} border-current` : `${c.pill} border-transparent opacity-70 hover:opacity-100`}`}>
                <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                {t}
              </button>
            );
          })}
        </div>
      )}

      {/* Day detail panel */}
      {selectedDate && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-semibold text-gray-900 text-sm">
              {new Date(selectedDate + "T00:00:00").toLocaleDateString("th-TH", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </h3>
            <button onClick={() => setSelectedDate(null)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
              <X className="w-4 h-4" />
            </button>
          </div>
          {selectedEvents.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">ไม่มีคลาสในวันนี้</p>
          ) : (
            <div className="p-4 space-y-3">
              {selectedEvents.map(ev => {
                const c = COLORS[teacherColor.get(ev.instructor) ?? 0];
                const isFull = ev.confirmedStudents >= ev.maxCapacity;
                return (
                  <div key={ev.sessionId} className={`flex gap-3 p-4 rounded-xl border ${c.card}`}>
                    <div className={`w-1 rounded-full shrink-0 ${c.dot}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className={`font-semibold text-sm ${c.text}`}>{ev.courseTitle}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{ev.instructor}</p>
                        </div>
                        <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${isFull ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"}`}>
                          {isFull ? "เต็ม" : "ว่าง"}
                        </span>
                      </div>
                      <div className="flex items-center flex-wrap gap-3 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{ev.startTime} - {ev.endTime} น.</span>
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{ev.confirmedStudents}/{ev.maxCapacity} คน</span>
                      </div>
                      {ev.zoomLink && (
                        <a href={ev.zoomLink} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 mt-2.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors">
                          <Video className="w-3.5 h-3.5" />เปิดห้องสอน
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
