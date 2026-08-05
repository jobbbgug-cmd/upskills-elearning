"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import QRCode from "react-qr-code";
import { QrCode, CheckCircle2, X, User, Search, UserCheck, ChevronDown, Loader2 } from "lucide-react";

interface Course  { _id: string; title: string; sessions: Session[] }
interface Session { _id: string; date: string; startTime: string; endTime: string }
interface Student { _id: string; name: string; email: string; profileImage?: string; gradeLevel?: string }
interface AttendanceRecord { studentId: { _id: string; name: string; email: string; profileImage?: string }; checkedInAt: string; method: string }

export default function AdminAttendancePage() {
  const [courses,    setCourses]    = useState<Course[]>([]);
  const [courseId,   setCourseId]   = useState("");
  const [sessionId,  setSessionId]  = useState("");
  const [qrToken,    setQrToken]    = useState("");
  const [qrLoading,  setQrLoading]  = useState(false);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [students,   setStudents]   = useState<Student[]>([]);
  const [search,     setSearch]     = useState("");
  const [checking,   setChecking]   = useState<string | null>(null);

  const BASE_URL = typeof window !== "undefined" ? window.location.origin : "";

  useEffect(() => {
    fetch("/api/owner/courses").then((r) => r.json()).then((d) => {
      const cs = Array.isArray(d) ? d : d.courses ?? [];
      setCourses(cs);
    });
  }, []);

  useEffect(() => {
    if (!courseId || !sessionId) { setAttendance([]); return; }
    fetch(`/api/attendance?courseId=${courseId}&sessionId=${sessionId}`)
      .then((r) => r.json()).then((d) => setAttendance(Array.isArray(d) ? d : []));
    fetch(`/api/owner/students?courseId=${courseId}`)
      .then((r) => r.json()).then((d) => setStudents(Array.isArray(d) ? d : []));
  }, [courseId, sessionId]);

  const selectedCourse  = courses.find((c) => c._id === courseId);
  const selectedSession = selectedCourse?.sessions.find((s) => s._id === sessionId);
  const checkedIds      = new Set(attendance.map((a) => a.studentId?._id));

  const generateQR = async () => {
    if (!courseId || !sessionId) return;
    setQrLoading(true);
    const res  = await fetch("/api/attendance/qr-check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, sessionId }),
    });
    const data = await res.json();
    if (data.token) setQrToken(data.token);
    setQrLoading(false);
  };

  const handleManualCheck = async (studentId: string) => {
    setChecking(studentId);
    const res = await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, sessionId, studentId }),
    });
    if (res.ok) {
      const rec = await res.json();
      setAttendance((prev) => [...prev.filter((a) => a.studentId?._id !== studentId), rec]);
    }
    setChecking(null);
  };

  const handleRemove = async (studentId: string) => {
    const res = await fetch("/api/attendance", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, sessionId, studentId }),
    });
    if (res.ok) setAttendance((prev) => prev.filter((a) => a.studentId?._id !== studentId));
  };

  const qrUrl = qrToken ? `${BASE_URL}/api/attendance/qr-check?token=${qrToken}` : "";
  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">เช็คชื่อ</h1>
        <p className="text-gray-500 text-sm mt-1">QR Code และเช็คชื่อแบบ manual</p>
      </div>

      {/* Selectors */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">คอร์ส</label>
            <div className="relative">
              <select value={courseId} onChange={(e) => { setCourseId(e.target.value); setSessionId(""); setQrToken(""); }}
                className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-8">
                <option value="">— เลือกคอร์ส —</option>
                {courses.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">รอบเรียน</label>
            <div className="relative">
              <select value={sessionId} onChange={(e) => { setSessionId(e.target.value); setQrToken(""); }}
                disabled={!courseId}
                className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-8 disabled:opacity-50">
                <option value="">— เลือกรอบ —</option>
                {selectedCourse?.sessions.map((s) => (
                  <option key={s._id} value={s._id}>
                    {new Date(s.date).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })} · {s.startTime}-{s.endTime}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {courseId && sessionId && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* QR Code panel */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <QrCode className="w-5 h-5 text-indigo-600" />
              <h2 className="font-semibold text-gray-900">QR Code เช็คชื่อ</h2>
            </div>
            {qrToken ? (
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-white border-2 border-indigo-100 rounded-2xl">
                  <QRCode value={qrUrl} size={200} />
                </div>
                <p className="text-xs text-gray-400 text-center">นักเรียนสแกน QR เพื่อเช็คชื่อ<br/>QR มีอายุ 4 ชั่วโมง</p>
                <button onClick={generateQR} className="text-xs text-indigo-600 hover:underline">สร้าง QR ใหม่</button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 py-8">
                <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center">
                  <QrCode className="w-10 h-10 text-indigo-300" />
                </div>
                <button onClick={generateQR} disabled={qrLoading}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-60">
                  {qrLoading ? <><Loader2 className="w-4 h-4 animate-spin" />กำลังสร้าง...</> : <><QrCode className="w-4 h-4" />สร้าง QR Code</>}
                </button>
              </div>
            )}
          </div>

          {/* Student list + manual check */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-indigo-600" />
                <h2 className="font-semibold text-gray-900">รายชื่อ</h2>
              </div>
              <span className="text-xs text-gray-400">{attendance.length}/{students.length} คน</span>
            </div>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหานักเรียน..."
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="space-y-1.5 max-h-80 overflow-y-auto">
              {filteredStudents.map((s) => {
                const checked = checkedIds.has(s._id);
                const rec = attendance.find((a) => a.studentId?._id === s._id);
                return (
                  <div key={s._id} className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${checked ? "bg-green-50" : "hover:bg-gray-50"}`}>
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 overflow-hidden">
                      {s.profileImage
                        ? <Image src={s.profileImage} alt={s.name} width={32} height={32} className="w-full h-full object-cover" />
                        : <span className="text-xs font-bold text-indigo-600">{s.name[0]}</span>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{s.name}</p>
                      {rec && (
                        <p className="text-xs text-green-600">
                          {rec.method === "qr" ? "QR" : "manual"} · {new Date(rec.checkedInAt).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      )}
                    </div>
                    {checked ? (
                      <button onClick={() => handleRemove(s._id)} className="p-1 text-green-500 hover:text-red-500 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    ) : (
                      <button onClick={() => handleManualCheck(s._id)} disabled={checking === s._id}
                        className="p-1 text-gray-300 hover:text-green-600 transition-colors disabled:opacity-50">
                        {checking === s._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                );
              })}
              {filteredStudents.length === 0 && (
                <div className="text-center py-8 text-gray-300"><User className="w-8 h-8 mx-auto mb-2" /><p className="text-xs">ไม่พบนักเรียน</p></div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
