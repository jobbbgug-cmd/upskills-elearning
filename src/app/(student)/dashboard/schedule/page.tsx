"use client";
import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, BookOpen, Video, Calendar, Clock, User } from "lucide-react";
import MeetButton from "@/components/MeetButton";

interface SessionEvent {
  bookingId: string;
  courseId: string;
  courseTitle: string;
  coverImage: string;
  date: string;
  startTime: string;
  endTime: string;
  zoomLink: string;
}

interface Student {
  _id: string;
  name: string;
  email: string;
  gradeLevel?: string;
}

const DAYS = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
const MONTHS_TH = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];

function toDateStr(d: Date) { return d.toISOString().slice(0, 10); }

export default function StudentSchedulePage() {
  const [role, setRole] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("all");

  const [events, setEvents] = useState<SessionEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingInit, setLoadingInit] = useState(true);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const today = toDateStr(new Date());
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());

  // Fetch role + students (admin only)
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then(async (d) => {
        const userRole = d.user?.role ?? "";
        setRole(userRole);
        if (userRole === "admin") {
          const res = await fetch("/api/admin/users");
          if (res.ok) {
            const all = await res.json();
            setStudents(all.filter((u: Student & { role: string; status: string }) =>
              u.role === "student" && u.status === "approved"
            ));
          }
        }
        setLoadingInit(false);
      });
  }, []);

  // Fetch events when student selection changes
  useEffect(() => {
    if (loadingInit) return;
    setLoadingEvents(true);
    setSelectedDate(null);
    const url = role === "admin" && selectedStudentId !== "all"
      ? `/api/schedule/student?userId=${selectedStudentId}`
      : "/api/schedule/student";
    fetch(url)
      .then((r) => r.json())
      .then((d) => { setEvents(d.events ?? []); setLoadingEvents(false); });
  }, [loadingInit, role, selectedStudentId]);

  const eventDates = useMemo(() => new Set(events.map((e) => e.date)), [events]);

  const calDays = useMemo(() => {
    const first = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const cells: (number | null)[] = Array(first).fill(null);
    for (let i = 1; i <= daysInMonth; i++) cells.push(i);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [calYear, calMonth]);

  function prevMonth() {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
  }
  function nextMonth() {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
  }

  const filteredEvents = selectedDate ? events.filter((e) => e.date === selectedDate) : events;

  const grouped = useMemo(() => {
    const map = new Map<string, SessionEvent[]>();
    for (const e of filteredEvents) {
      if (!map.has(e.date)) map.set(e.date, []);
      map.get(e.date)!.push(e);
    }
    return map;
  }, [filteredEvents]);

  function dateLabel(d: string) {
    return new Date(d + "T00:00:00").toLocaleDateString("th-TH", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  }

  const selectedStudent = students.find((s) => s._id === selectedStudentId);

  if (loadingInit) return <div className="text-center py-20 text-gray-400 text-sm">กำลังโหลด...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ตารางเรียน</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {role === "admin" && selectedStudent
              ? `ของ ${selectedStudent.name}${selectedStudent.gradeLevel ? ` · ${selectedStudent.gradeLevel}` : ""}`
              : "คอร์สที่จองและยืนยันแล้วทั้งหมด"}
          </p>
        </div>

        {/* Student selector — admin only */}
        {role === "admin" && students.length > 0 && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <User className="w-4 h-4 text-gray-400 shrink-0" />
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="flex-1 sm:flex-none text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 sm:min-w-[200px]"
            >
              <option value="all">เลือกนักเรียน...</option>
              {students.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}{s.gradeLevel ? ` (${s.gradeLevel})` : ""}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Admin with no student selected */}
      {role === "admin" && selectedStudentId === "all" ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <User className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="text-sm text-gray-500 font-medium">เลือกนักเรียนเพื่อดูตารางเรียน</p>
          <p className="text-xs text-gray-400 mt-1">มีนักเรียนทั้งหมด {students.length} คน</p>
        </div>
      ) : (
        <>
          {/* Mini Calendar */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              <span className="text-sm font-semibold text-gray-800">
                {MONTHS_TH[calMonth]} {calYear + 543}
              </span>
              <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <div className="grid grid-cols-7 mb-1">
              {DAYS.map((d) => (
                <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-y-1">
              {calDays.map((day, i) => {
                if (!day) return <div key={i} />;
                const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const hasEvent = eventDates.has(dateStr);
                const isToday = dateStr === today;
                const isSelected = selectedDate === dateStr;
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                    className={`relative flex flex-col items-center py-1.5 rounded-xl transition-colors text-xs
                      ${isSelected ? "bg-indigo-600 text-white" : isToday ? "bg-indigo-50 text-indigo-700 font-bold" : "hover:bg-gray-50 text-gray-700"}`}
                  >
                    {day}
                    {hasEvent && (
                      <span className={`w-1 h-1 rounded-full mt-0.5 ${isSelected ? "bg-white" : "bg-indigo-400"}`} />
                    )}
                  </button>
                );
              })}
            </div>

            {selectedDate && (
              <div className="mt-3 pt-3 border-t border-gray-100 text-center">
                <button onClick={() => setSelectedDate(null)} className="text-xs text-indigo-500 hover:text-indigo-700">
                  ล้างตัวกรอง — แสดงทั้งหมด
                </button>
              </div>
            )}
          </div>

          {/* Sessions list */}
          {loadingEvents ? (
            <div className="text-center py-10 text-gray-400 text-sm">กำลังโหลด...</div>
          ) : grouped.size === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <Calendar className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p className="text-sm text-gray-400">{selectedDate ? "ไม่มีคลาสในวันนี้" : "ยังไม่มีคลาสที่จอง"}</p>
              {!selectedDate && role !== "admin" && (
                <Link href="/courses" className="text-indigo-600 text-sm font-medium hover:underline mt-2 inline-block">
                  ดูคอร์สทั้งหมด →
                </Link>
              )}
            </div>
          ) : (
            Array.from(grouped.entries()).map(([date, dayEvents]) => {
              const isPast = date < today;
              const isToday = date === today;
              return (
                <div key={date}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      isToday ? "bg-indigo-600 text-white" : isPast ? "bg-gray-100 text-gray-500" : "bg-green-100 text-green-700"
                    }`}>
                      {isToday ? "วันนี้" : isPast ? "ผ่านไปแล้ว" : "กำลังจะมาถึง"}
                    </div>
                    <span className="text-sm font-semibold text-gray-700">{dateLabel(date)}</span>
                  </div>

                  <div className="space-y-3 mb-6">
                    {dayEvents.map((ev) => (
                      <div key={ev.bookingId} className={`bg-white rounded-2xl border p-4 flex gap-4 ${
                        isToday ? "border-indigo-200 shadow-sm" : "border-gray-100"
                      }`}>
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gradient-to-br from-indigo-100 to-purple-100">
                          {ev.coverImage
                            ? <Image src={ev.coverImage} alt={ev.courseTitle} fill className="object-cover" />
                            : <div className="flex items-center justify-center h-full"><BookOpen className="w-6 h-6 text-indigo-300" /></div>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 text-sm line-clamp-1">{ev.courseTitle}</p>
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{ev.startTime} - {ev.endTime} น.</span>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {ev.zoomLink && !isPast && role !== "admin" && (
                              <MeetButton
                                sessionDate={date}
                                startTime={ev.startTime}
                                endTime={ev.endTime}
                                meetLink={ev.zoomLink}
                              />
                            )}
                            <Link
                              href={`/learn/${ev.courseId}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium hover:bg-indigo-100 transition-colors"
                            >
                              <Video className="w-3.5 h-3.5" />
                              เข้าคอร์สเรียน
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </>
      )}
    </div>
  );
}
