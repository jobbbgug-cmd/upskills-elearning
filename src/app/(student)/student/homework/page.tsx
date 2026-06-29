"use client";
import { useState, useEffect } from "react";
import { BookOpen, Upload, CheckCircle, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";

interface Homework {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
  courseId: string;
  courseName?: string;
}

interface HomeworkSubmission {
  _id: string;
  homeworkId: string;
  status: "submitted" | "graded";
  score?: number;
  feedback?: string;
  submittedAt: string;
}

export default function StudentHomeworkPage() {
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [myRole, setMyRole] = useState("");

  useEffect(() => {
    const load = async () => {
      const [hwRes, subRes, meRes] = await Promise.all([
        fetch("/api/student/homework"),
        fetch("/api/student/homework/submissions"),
        fetch("/api/auth/me"),
      ]);

      if (hwRes.ok) setHomeworks(await hwRes.json());
      if (subRes.ok) setSubmissions(await subRes.json());
      if (meRes.ok) {
        const data = await meRes.json();
        setMyRole(data.user?.role ?? "");
      }

      setLoading(false);
    };

    load();
  }, []);

  const getSubmission = (homeworkId: string) =>
    submissions.find((s) => s.homeworkId === homeworkId);

  const getStatus = (homework: Homework) => {
    const submission = getSubmission(homework._id);
    const dueDate = new Date(homework.dueDate);
    const now = new Date();

    if (submission) {
      return submission.status === "graded" ? "graded" : "submitted";
    }
    return now > dueDate ? "overdue" : "pending";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "graded":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "submitted":
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case "overdue":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "graded":
        return "ตรวจแล้ว";
      case "submitted":
        return "ส่งแล้ว";
      case "overdue":
        return "เลยกำหนดเวลา";
      default:
        return "รอส่ง";
    }
  };

  if (loading) return <div className="text-center py-20">กำลังโหลด...</div>;

  const isStudent = myRole === "student";
  const isParent = myRole === "parent";

  if (!isStudent && !isParent) {
    return <div className="text-center py-20 text-red-500">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 md:py-10">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2 md:gap-3">
            <BookOpen className="w-6 h-6 md:w-8 md:h-8 text-violet-600" />
            การบ้าน
          </h1>
          <p className="text-sm md:text-base text-gray-500 mt-2">
            {isParent ? "ดูการบ้านของลูก" : "ส่งและติดตามการบ้านของคุณ"}
          </p>
        </div>

      <div className="space-y-4">
        {homeworks.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">ยังไม่มีการบ้าน</p>
          </div>
        ) : (
          homeworks.map((hw) => {
            const submission = getSubmission(hw._id);
            const status = getStatus(hw);

            return (
              <div
                key={hw._id}
                className="bg-white rounded-xl md:rounded-2xl border border-gray-200 p-4 md:p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <h3 className="text-base md:text-lg font-semibold text-gray-900 break-words">{hw.title}</h3>
                      <div className="flex items-center gap-1 px-2 py-1 md:px-3 md:py-1 rounded-full bg-gray-100 shrink-0 w-fit">
                        {getStatusIcon(status)}
                        <span className="text-xs md:text-sm font-medium text-gray-700">
                          {getStatusText(status)}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-600 text-xs md:text-sm mt-2 break-words">{hw.description}</p>

                    <div className="flex flex-col gap-1 mt-3 text-xs md:text-sm text-gray-500">
                      <span>วิชา: {hw.courseName || "—"}</span>
                      <span>ครบกำหนด: {new Date(hw.dueDate).toLocaleDateString("th-TH")}</span>
                      <span>คะแนนเต็ม: {hw.maxScore}</span>
                    </div>

                    {submission && submission.status === "graded" && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-xs md:text-sm font-medium text-green-700">
                          คะแนน: {submission.score}/{hw.maxScore}
                        </p>
                        {submission.feedback && (
                          <p className="text-xs md:text-sm text-green-600 mt-1">
                            ความเห็น: {submission.feedback}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 w-full md:w-auto md:ml-4 md:flex-col">
                    {isStudent && !submission && (
                      <Link
                        href={`/student/homework/${hw._id}`}
                        className="flex-1 md:flex-none px-3 md:px-4 py-2 bg-violet-600 text-white text-center md:text-left rounded-lg flex md:flex items-center justify-center md:justify-start gap-2 hover:bg-violet-700 transition-colors whitespace-nowrap text-sm md:text-base"
                      >
                        <Upload className="w-4 h-4" />
                        ส่งการบ้าน
                      </Link>
                    )}

                    {isStudent && submission && (
                      <Link
                        href={`/student/homework/${hw._id}`}
                        className="flex-1 md:flex-none px-3 md:px-4 py-2 bg-gray-200 text-gray-700 text-center rounded-lg hover:bg-gray-300 transition-colors whitespace-nowrap text-sm md:text-base"
                      >
                        ดูรายละเอียด
                      </Link>
                    )}
                  </div>
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
