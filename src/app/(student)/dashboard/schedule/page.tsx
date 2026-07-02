"use client";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Clock, Video, User, X, BookOpen } from "lucide-react";
import MeetButton from "@/components/MeetButton";
import LoadingSpinner from "@/components/LoadingSpinner";

interface SessionEvent {
  bookingId: string; courseId: string; courseTitle: string; coverImage: string;
  date: string; startTime: string; endTime: string; zoomLink: string;
}
interface Student { _id: string; name: string; email: string; gradeLevel?: string; }

const MONTHS_TH = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
const DAYS_SHORT = ["อา","จ","อ","พ","พฤ","ศ","ส"];
const COURSE_COLORS = [
  "bg-indigo-100 text-indigo-700","bg-violet-100 text-violet-700","bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700","bg-rose-100 text-rose-700","bg-blue-100 text-blue-700",
];

function toDateStr(d: Date) { return d.toISOString().slice(0, 10); }
type Cell = { day: number; month: "prev" | "curr" | "next" };

export default function StudentSchedulePage() {
  const [role, setRole] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("all");
  const [events, setEvents] = useState<SessionEvent[]>([]);
  const [loadingInit, setLoadingInit] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const today = toDateStr(new Date());
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(async d => {
      const userRole = d.user?.role ?? "";
      setRole(userRole);
      if (userRole === "admin") {
        const res = await fetch("/api/admin/users");
        if (res.ok) {
          const all = await res.json();
          setStudents(all.filter((u: Student & { role: string; status: string }) => u.role === "student" && u.status === "approved"));
        }
      }
      setLoadingInit(false);
    });
  }, []);

  useEffect(() => {
    if (loadingInit) return;
    if (role === "admin" && selectedStudentId === "all") { setEvents([]); return; }
    setLoadingEvents(true);
    setSelectedDate(null);
    const url = role === "admin" && selectedStudentId !== "all"
      ? `/api/schedule/student?userId=${selectedStudentId}` : "/api/schedule/student";
    fetch(url).then(r => r.json()).then(d => { setEvents(d.events ?? []); setLoadingEvents(false); });
  }, [loadingInit, role, selectedStudentId]);

  // Build course→color map
  const courseColor = useMemo(() => {
    const m = new Map<string, string>(); let i = 0;
    events.forEach(e => { if (!m.has(e.courseId)) m.set(e.courseId, COURSE_COLORS[i++ % COURSE_COLORS.length]); });
    return m;
  }, [events]);

  const byDate = useMemo(() => {
    const m = new Map<string, SessionEvent[]>();
    for (const e of events) { if (!m.has(e.date)) m.set(e.date, []); m.get(e.date)!.push(e); }
    return m;
  }, [events]);

  const calCells = useMemo((): Cell[] => {
    const firstDay = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const prevTotal = new Date(calYear, calMonth, 0).getDate();
    const cells: Cell[] = [];
    for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: prevTotal - i, month: "prev" });
    for (let i = 1; i <= daysInMonth; i++) cells.push({ day: i, month: "curr" });
    let n = 1; while (cells.length % 7 !== 0) cells.push({ day: n++, month: "next" });
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
  const selectedStudent = students.find(s => s._id === selectedStudentId);

  if (loadingInit) return <LoadingSpinner />;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ตารางเรียน</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {role === "admin" && selectedStudent
              ? `ของ ${selectedStudent.name}${selectedStudent.gradeLevel ? ` · ${selectedStudent.gradeLevel}` : ""}`
              : "คอร์สที่จองและยืนยันแล้วทั้งหมด"}
          </p>
        </div>
        {role === "admin" && students.length > 0 && (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400 shrink-0" />
            <select value={selectedStudentId} onChange={e => setSelectedStudentId(e.target.value)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 min-w-[200px]">
              <option value="all">เลือกนักเรียน...</option>
              {students.map(s => <option key={s._id} value={s._id}>{s.name}{s.gradeLevel ? ` (${s.gradeLevel})` : ""}</option>)}
            </select>
          </div>
        )}
      </div>

      {role === "admin" && selectedStudentId === "all" ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <User className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="text-sm text-gray-500 font-medium">เลือกนักเรียนเพื่อดูตารางเรียน</p>
          <p className="text-xs text-gray-400 mt-1">มีนักเรียนทั้งหมด {students.length} คน</p>
        </div>
      ) : loadingEvents ? (
        <LoadingSpinner />
      ) : (
        <>
          {/* Calendar */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
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
            <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
              {DAYS_SHORT.map((d, i) => (
                <div key={d} className={`py-2.5 text-center text-xs font-semibold uppercase tracking-wide
                  ${i === 0 ? "text-rose-400" : i === 6 ? "text-blue-400" : "text-gray-400"}`}>{d}</div>
              ))}
            </div>
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
                      ${isToday ? "theme-today" : isSel ? "bg-gray-200 text-gray-800" : !isCurr ? "text-gray-300" : "text-gray-700"}`}>
                      {cell.day}
                    </div>
                    <div className="space-y-0.5">
                      {dayEvs.slice(0, 3).map(ev => (
                        <div key={ev.bookingId} className={`px-1.5 py-0.5 rounded text-xs truncate leading-snug ${courseColor.get(ev.courseId) ?? COURSE_COLORS[0]}`}>
                          <span className="font-semibold">{ev.startTime}</span> <span className="hidden sm:inline">{ev.courseTitle}</span>
                        </div>
                      ))}
                      {dayEvs.length > 3 && <div className="text-xs text-indigo-400 px-1 font-medium">+{dayEvs.length - 3} อื่นๆ</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detail panel */}
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
                    const isPast = selectedDate < today;
                    const color = courseColor.get(ev.courseId) ?? COURSE_COLORS[0];
                    return (
                      <div key={ev.bookingId} className="flex gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50">
                        <div className={`w-1 rounded-full shrink-0 ${color.split(" ")[0].replace("bg-", "bg-").replace("-100", "-400")}`} />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900">{ev.courseTitle}</p>
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{ev.startTime} - {ev.endTime} น.</span>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2.5">
                            {ev.zoomLink && !isPast && role !== "admin" && (
                              <MeetButton sessionDate={selectedDate} startTime={ev.startTime} endTime={ev.endTime} meetLink={ev.zoomLink} />
                            )}
                            <Link href={`/learn/${ev.courseId}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium hover:bg-indigo-100 transition-colors">
                              <BookOpen className="w-3.5 h-3.5" />เข้าคอร์สเรียน
                            </Link>
                            {ev.zoomLink && !isPast && role === "admin" && (
                              <a href={ev.zoomLink} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors">
                                <Video className="w-3.5 h-3.5" />ลิงก์เรียน
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
