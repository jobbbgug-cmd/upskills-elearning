"use client";
import { useState, useEffect } from "react";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";

interface CourseAttendance {
  courseId: string;
  courseName: string;
  total: number;
  present: number;
  percentage: number;
}

export default function StudentAttendancePage() {
  const [attendance, setAttendance] = useState<CourseAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [myRole, setMyRole] = useState("");

  useEffect(() => {
    const load = async () => {
      const [attRes, meRes] = await Promise.all([
        fetch("/api/student/attendance/summary"),
        fetch("/api/auth/me"),
      ]);

      if (attRes.ok) setAttendance(await attRes.json());
      if (meRes.ok) {
        const data = await meRes.json();
        setMyRole(data.user?.role ?? "");
      }

      setLoading(false);
    };

    load();
  }, []);

  const getStatusIcon = (percentage: number) => {
    if (percentage >= 80) return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    if (percentage >= 60) return <Clock className="w-5 h-5 text-yellow-500" />;
    return <AlertCircle className="w-5 h-5 text-red-500" />;
  };

  const getStatusText = (percentage: number) => {
    if (percentage >= 80) return "ครบ";
    if (percentage >= 60) return "เสี่ยง";
    return "ต่ำ";
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
          <CheckCircle2 className="w-8 h-8 text-violet-600" />
          เช็คชื่อ
        </h1>
        <p className="text-gray-500 mt-2">
          {isParent ? "ดูสถานะการเช็คชื่อของลูก" : "ดูการเช็คชื่อของคุณในแต่ละวิชา"}
        </p>
      </div>

      {attendance.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">ยังไม่มีข้อมูลการเช็คชื่อ</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {attendance.map((att) => (
            <div
              key={att.courseId}
              className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">{att.courseName}</h3>
                    <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100">
                      {getStatusIcon(att.percentage)}
                      <span className="text-sm font-medium text-gray-700">
                        {getStatusText(att.percentage)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-6">
                    <div>
                      <p className="text-sm text-gray-500">ครั้งที่เช็คชื่อแล้ว</p>
                      <p className="text-2xl font-bold text-gray-900">{att.present}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">ครั้งทั้งหมด</p>
                      <p className="text-2xl font-bold text-gray-900">{att.total}</p>
                    </div>
                  </div>
                </div>

                <div className="ml-8 text-right">
                  <p className="text-sm text-gray-500 mb-2">ร้อยละ</p>
                  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-violet-400 to-violet-600 flex items-center justify-center text-white">
                    <span className="text-3xl font-bold">{att.percentage}%</span>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-6 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    att.percentage >= 80
                      ? "bg-green-500"
                      : att.percentage >= 60
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${att.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
