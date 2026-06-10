"use client";
import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, BookOpen, Users, Clock, Video, Calendar, GraduationCap } from "lucide-react";

interface TeachingSession {
  courseId: string;
  courseTitle: string;
  instructor: string;
  coverImage: string;
  sessionId: string;
  date: string;
  startTime: string;
  endTime: string;
  zoomLink: string;
  confirmedStudents: number;
  maxCapacity: number;
}

const DAYS = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
const MONTHS_TH = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];

function toDateStr(d: Date) { return d.toISOString().slice(0, 10); }

export default function TeacherSchedulePage() {
  const [events, setEvents] = useState<TeachingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("upcoming");
  const [selectedTeacher, setSelectedTeacher] = useState<string>("all");
  const today = toDateStr(new Date());

  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());

  useEffect(() => {
    fetch("/api/schedule/teacher")
      .then((r) => r.json())
      .then((d) => { setEvents(d.events ?? []); setLoading(false); });
  }, []);

  // Unique teachers sorted alphabetically
  const teachers = useMemo(() => {
    const map = new Map<string, string>();
    events.forEach((e) => { if (!map.has(e.instructor)) map.set(e.instructor, e.instructor); });
    return Array.from(map.keys()).sort();
  }, [events]);

  const visibleEvents = useMemo(() =>
    selectedTeacher === "all" ? events : events.filter((e) => e.instructor === selectedTeacher),
  [events, selectedTeacher]);

  const eventDates = useMemo(() => new Set(visibleEvents.map((e) => e.date)), [visibleEvents]);

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

  const filteredEvents = useMemo(() => {
    let list = visibleEvents;
    if (selectedDate) list = list.filter((e) => e.date === selectedDate);
    else if (filter === "upcoming") list = list.filter((e) => e.date >= today);
    else if (filter === "past") list = list.filter((e) => e.date < today);
    return list;
  }, [visibleEvents, selectedDate, filter, today]);

  const grouped = useMemo(() => {
    const map = new Map<string, TeachingSession[]>();
    for (const e of filteredEvents) {
      if (!map.has(e.date)) map.set(e.date, []);
      map.get(e.date)!.push(e);
    }
    return map;
  }, [filteredEvents]);

  function dateLabel(d: string) {
    const dt = new Date(d + "T00:00:00");
    return dt.toLocaleDateString("th-TH", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  }

  const upcomingCount = visibleEvents.filter((e) => e.date >= today).length;
  const pastCount = visibleEvents.filter((e) => e.date < today).length;
  const todayCount = visibleEvents.filter((e) => e.date === today).length;

  if (loading) return <div className="text-center py-20 text-gray-400 text-sm">กำลังโหลด...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ตารางสอน</h1>
          <p className="text-sm text-gray-500 mt-0.5">ตารางการสอนทั้งหมด</p>
        </div>
        {/* Teacher filter — show only when there are multiple teachers */}
        {teachers.length > 1 && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <GraduationCap className="w-4 h-4 text-gray-400 shrink-0" />
            <select
              value={selectedTeacher}
              onChange={(e) => { setSelectedTeacher(e.target.value); setSelectedDate(null); }}
              className="flex-1 sm:flex-none text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 sm:min-w-[180px]"
            >
              <option value="all">ครูทั้งหมด ({teachers.length} คน)</option>
              {teachers.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{upcomingCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">คลาสที่กำลังจะมาถึง</p>
        </div>
        <div className="bg-white rounded-2xl border border-indigo-100 bg-indigo-50 p-4 text-center">
          <p className="text-2xl font-bold text-indigo-600">{todayCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">คลาสวันนี้</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-gray-400">{pastCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">คลาสที่ผ่านไปแล้ว</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start">
        {/* Calendar + filter */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            {/* Month nav */}
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
                      <span className={`w-1 h-1 rounded-full mt-0.5 ${isSelected ? "bg-white" : "bg-amber-400"}`} />
                    )}
                  </button>
                );
              })}
            </div>

            {selectedDate && (
              <div className="mt-3 pt-3 border-t border-gray-100 text-center">
                <button onClick={() => setSelectedDate(null)} className="text-xs text-indigo-500 hover:text-indigo-700">
                  ล้างตัวกรอง
                </button>
              </div>
            )}
          </div>

          {/* Filter tabs */}
          {!selectedDate && (
            <div className="bg-white rounded-2xl border border-gray-100 p-1.5 flex gap-1">
              {([["all","ทั้งหมด"], ["upcoming","กำลังจะมา"], ["past","ผ่านไปแล้ว"]] as const).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setFilter(val)}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors ${
                    filter === val ? "bg-indigo-600 text-white" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Session list */}
        <div className="space-y-6">
          {grouped.size === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <Calendar className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p className="text-sm text-gray-400">ไม่มีคลาสในช่วงนี้</p>
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

                  <div className="space-y-3">
                    {dayEvents.map((ev) => {
                      const fillPct = ev.maxCapacity > 0 ? (ev.confirmedStudents / ev.maxCapacity) * 100 : 0;
                      const isFull = ev.confirmedStudents >= ev.maxCapacity;
                      return (
                        <div key={ev.sessionId} className={`bg-white rounded-2xl border p-4 flex gap-4 ${
                          isToday ? "border-amber-200 shadow-sm" : "border-gray-100"
                        }`}>
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gradient-to-br from-indigo-100 to-purple-100">
                            {ev.coverImage
                              ? <Image src={ev.coverImage} alt={ev.courseTitle} fill className="object-cover" />
                              : <div className="flex items-center justify-center h-full"><BookOpen className="w-6 h-6 text-indigo-300" /></div>
                            }
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-semibold text-gray-800 text-sm line-clamp-1">{ev.courseTitle}</p>
                              <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${
                                isFull ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"
                              }`}>
                                {isFull ? "เต็ม" : "ว่าง"}
                              </span>
                            </div>

                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{ev.startTime} - {ev.endTime} น.</span>
                              <span className="flex items-center gap-1"><Users className="w-3 h-3" />{ev.confirmedStudents}/{ev.maxCapacity} คน</span>
                            </div>

                            {/* Student fill bar */}
                            <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden w-40">
                              <div
                                className={`h-full rounded-full transition-all ${isFull ? "bg-red-400" : "bg-green-400"}`}
                                style={{ width: `${fillPct}%` }}
                              />
                            </div>

                            {ev.zoomLink && !isPast && (
                              <a
                                href={ev.zoomLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
                              >
                                <Video className="w-3.5 h-3.5" />
                                เปิดห้องสอน
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
