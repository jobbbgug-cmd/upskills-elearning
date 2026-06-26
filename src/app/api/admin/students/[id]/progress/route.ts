import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import VideoProgress from "@/models/VideoProgress";
import { Homework, HomeworkSubmission } from "@/models/Homework";
import { Quiz, QuizAttempt } from "@/models/Quiz";
import Attendance from "@/models/Attendance";
import CourseContent from "@/models/CourseContent";
import mongoose from "mongoose";

type HW   = { _id: mongoose.Types.ObjectId; title: string; maxScore: number };
type HWSub = { homeworkId: mongoose.Types.ObjectId; score?: number; status: string };
type QDoc  = { _id: mongoose.Types.ObjectId; title: string };
type QAtt  = { quizId: mongoose.Types.ObjectId; score: number; totalPoints: number; percentage: number };
type AttRec = { sessionId: string; checkedInAt: Date; method: string };

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser();
    if (!auth || (auth.role !== "admin" && auth.role !== "teacher" && auth.role !== "super_admin"))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { id: studentId } = await params;

    const bookings = await Booking.find({ userId: studentId, status: "confirmed" })
      .populate("courseId", "title")
      .lean() as unknown as { courseId: { _id: mongoose.Types.ObjectId; title: string } | null }[];

    const results = await Promise.all(bookings.map(async (b) => {
      const course = b.courseId;
      if (!course) return null;
      const cid = course._id;

      const [content, watchedCount] = await Promise.all([
        CourseContent.findOne({ courseId: cid }).select("teachingClips summaryClips").lean() as Promise<{
          teachingClips?: unknown[]; summaryClips?: unknown[];
        } | null>,
        VideoProgress.countDocuments({ userId: studentId, courseId: cid }),
      ]);
      const totalClips = (content?.teachingClips?.length ?? 0) + (content?.summaryClips?.length ?? 0);

      const [homeworks, hwSubs] = await Promise.all([
        Homework.find({ courseId: cid, isActive: true }).select("_id title maxScore").lean() as unknown as Promise<HW[]>,
        HomeworkSubmission.find({ studentId, courseId: cid }).select("homeworkId score status").lean() as unknown as Promise<HWSub[]>,
      ]);
      const hwMap = Object.fromEntries(hwSubs.map((s) => [s.homeworkId.toString(), s]));
      const hwData = homeworks.map((hw) => ({
        title: hw.title, maxScore: hw.maxScore, sub: hwMap[hw._id.toString()] ?? null,
      }));

      const [quizzes, attempts] = await Promise.all([
        Quiz.find({ courseId: cid, isActive: true }).select("_id title").lean() as unknown as Promise<QDoc[]>,
        QuizAttempt.find({ studentId, courseId: cid, status: "submitted" })
          .sort({ score: -1 }).select("quizId score totalPoints percentage").lean() as unknown as Promise<QAtt[]>,
      ]);
      const bestAttempt = Object.fromEntries(
        attempts.reduce((map, a) => {
          const key = a.quizId.toString();
          if (!map.has(key) || a.percentage > (map.get(key)?.percentage ?? 0)) map.set(key, a);
          return map;
        }, new Map<string, QAtt>()).entries()
      );
      const quizData = quizzes.map((q) => ({
        title: q.title, attempt: bestAttempt[q._id.toString()] ?? null,
      }));

      const attRecords = await Attendance.find({ studentId, courseId: cid })
        .select("sessionId checkedInAt method").sort({ checkedInAt: -1 })
        .lean() as unknown as AttRec[];

      return {
        courseId: cid.toString(), courseTitle: course.title,
        video: { watched: watchedCount, total: totalClips },
        homework: hwData, quiz: quizData, attendance: attRecords,
      };
    }));

    return NextResponse.json(results.filter(Boolean));
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
