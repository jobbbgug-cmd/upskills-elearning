"use client";
import { useState, useEffect } from "react";
import { Video, Calendar, Clock, ExternalLink } from "lucide-react";
import Link from "next/link";

interface LiveClass {
  _id: string;
  title: string;
  description: string;
  scheduledAt: string;
  duration: number;
  status: "upcoming" | "live" | "ended";
  meetLink: string;
  replayLink: string;
  courseId: string;
  courseName?: string;
  createdBy: string;
}

export default function StudentLiveClassPage() {
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [myRole, setMyRole] = useState("");

  useEffect(() => {
    const load = async () => {
      const [lcRes, meRes] = await Promise.all([
        fetch("/api/student/live-class"),
        fetch("/api/auth/me"),
      ]);

      if (lcRes.ok) setClasses(await lcRes.json());
      if (meRes.ok) {
        const data = await meRes.json();
        setMyRole(data.user?.role ?? "");
      }

      setLoading(false);
    };

    load();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "live":
        return "bg-red-100 text-red-700";
      case "upcoming":
        return "bg-blue-100 text-blue-700";
      case "ended":
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "live":
        return "🔴 กำลังสด";
      case "upcoming":
        return "📅 จะมาถึง";
      case "ended":
        return "✅ สิ้นสุดแล้ว";
    }
  };

  const isStudent = myRole === "student";
  const isParent = myRole === "parent";

  if (loading) return <div className="text-center py-20">กำลังโหลด...</div>;

  if (!isStudent && !isParent) {
    return <div className="text-center py-20 text-red-500">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Video className="w-8 h-8 text-violet-600" />
          Live Class
        </h1>
        <p className="text-gray-500 mt-2">
          {isParent ? "ดูห้องเรียนของลูก" : "เข้าร่วมและดูห้องเรียนออนไลน์"}
        </p>
      </div>

      <div className="space-y-4">
        {classes.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl">
            <Video className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">ยังไม่มี Live Class</p>
          </div>
        ) : (
          classes.map((lc) => (
            <div
              key={lc._id}
              className={`rounded-2xl border p-6 hover:shadow-lg transition-shadow ${
                lc.status === "live"
                  ? "border-red-300 bg-red-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">{lc.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(lc.status)}`}>
                      {getStatusText(lc.status)}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mt-2">{lc.description}</p>

                  <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(lc.scheduledAt).toLocaleDateString("th-TH")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {new Date(lc.scheduledAt).toLocaleTimeString("th-TH", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      ({lc.duration} นาที)
                    </span>
                    <span>วิชา: {lc.courseName || "—"}</span>
                  </div>
                </div>

                <div className="ml-4 flex gap-2">
                  {lc.status === "live" && lc.meetLink && (
                    <a
                      href={lc.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center gap-2 hover:bg-red-700 transition-colors"
                    >
                      <Video className="w-4 h-4" />
                      เข้าห้องเรียน
                    </a>
                  )}

                  {lc.status === "ended" && lc.replayLink && (
                    <a
                      href={lc.replayLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-violet-600 text-white rounded-lg flex items-center gap-2 hover:bg-violet-700 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      ดูบันทึก
                    </a>
                  )}

                  {lc.status === "upcoming" && (
                    <div className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg">
                      รอเริ่มสด
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
