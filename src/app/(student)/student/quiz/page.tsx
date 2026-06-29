"use client";
import { useState, useEffect } from "react";
import { BookOpen, Trophy, Clock } from "lucide-react";
import Link from "next/link";

interface Quiz {
  _id: string;
  title: string;
  description: string;
  courseId: string;
  courseName?: string;
  timeLimit: number;
  maxAttempts: number;
  showResultAfter: boolean;
}

interface QuizAttempt {
  _id: string;
  quizId: string;
  score: number;
  totalPoints: number;
  percentage: number;
  completedAt: string;
}

export default function StudentQuizPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [myRole, setMyRole] = useState("");

  useEffect(() => {
    const load = async () => {
      const [qRes, aRes, meRes] = await Promise.all([
        fetch("/api/student/quiz"),
        fetch("/api/student/quiz/attempts"),
        fetch("/api/auth/me"),
      ]);

      if (qRes.ok) setQuizzes(await qRes.json());
      if (aRes.ok) setAttempts(await aRes.json());
      if (meRes.ok) {
        const data = await meRes.json();
        setMyRole(data.user?.role ?? "");
      }

      setLoading(false);
    };

    load();
  }, []);

  const getAttempts = (quizId: string) =>
    attempts.filter((a) => a.quizId === quizId);

  const getBestScore = (quizId: string) => {
    const quizAttempts = getAttempts(quizId);
    if (quizAttempts.length === 0) return null;
    return quizAttempts.reduce((best, current) =>
      current.percentage > best.percentage ? current : best
    );
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
          <Trophy className="w-8 h-8 text-violet-600" />
          ข้อสอบ
        </h1>
        <p className="text-gray-500 mt-2">
          {isParent ? "ดูคะแนนสอบของลูก" : "ทำและดูคะแนนสอบของคุณ"}
        </p>
      </div>

      <div className="space-y-4">
        {quizzes.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">ยังไม่มีข้อสอบ</p>
          </div>
        ) : (
          quizzes.map((quiz) => {
            const bestScore = getBestScore(quiz._id);
            const quizAttempts = getAttempts(quiz._id);

            return (
              <div
                key={quiz._id}
                className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{quiz.title}</h3>
                    <p className="text-gray-600 text-sm mt-2">{quiz.description}</p>

                    <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                      <span>วิชา: {quiz.courseName || "—"}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        เวลา: {quiz.timeLimit} นาที
                      </span>
                      <span>จำนวนครั้ง: {quiz.maxAttempts || "ไม่จำกัด"}</span>
                    </div>

                    {bestScore && (
                      <div className="mt-4 p-3 bg-violet-50 border border-violet-200 rounded-lg">
                        <p className="text-sm font-medium text-violet-700">
                          คะแนนดีที่สุด: {bestScore.score}/{bestScore.totalPoints} ({bestScore.percentage}%)
                        </p>
                        <p className="text-xs text-violet-600 mt-1">
                          เสร็จเมื่อ: {new Date(bestScore.completedAt).toLocaleDateString("th-TH")}
                        </p>
                      </div>
                    )}

                    {quizAttempts.length > 1 && (
                      <div className="mt-3 text-sm text-gray-500">
                        ทำแล้ว {quizAttempts.length} ครั้ง
                      </div>
                    )}
                  </div>

                  {isStudent && (
                    <Link
                      href={`/student/quiz/${quiz._id}`}
                      className="ml-4 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors whitespace-nowrap"
                    >
                      {bestScore ? "ทำอีกครั้ง" : "เริ่มทำ"}
                    </Link>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
