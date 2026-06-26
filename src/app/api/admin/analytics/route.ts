import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { resolveInstitutionId } from "@/lib/tenant";
import mongoose from "mongoose";
import Booking from "@/models/Booking";
import Course from "@/models/Course";
import User from "@/models/User";
import VideoProgress from "@/models/VideoProgress";
import { Homework, HomeworkSubmission } from "@/models/Homework";
import { Quiz, QuizAttempt } from "@/models/Quiz";
import Attendance from "@/models/Attendance";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || (auth.role !== "admin" && auth.role !== "super_admin"))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const institutionId = await resolveInstitutionId(req, auth.institutionId);
    const tenantClause = institutionId ? { institutionId: new mongoose.Types.ObjectId(institutionId) } : {};

    const courses = await Course.find(tenantClause).select("_id title isActive").lean() as unknown as { _id: mongoose.Types.ObjectId; title: string; isActive: boolean }[];
    const courseIds = courses.map((c) => c._id);

    // Students enrolled per course
    const enrollments = await Booking.aggregate([
      { $match: { status: "confirmed", courseId: { $in: courseIds } } },
      { $group: { _id: "$courseId", students: { $sum: 1 } } },
    ]);
    const enrollMap = Object.fromEntries(enrollments.map((e) => [e._id.toString(), e.students]));

    // Video clips watched per course (distinct students who watched ≥1 clip)
    const videoStats = await VideoProgress.aggregate([
      { $match: { courseId: { $in: courseIds } } },
      { $group: { _id: { courseId: "$courseId", userId: "$userId" } } },
      { $group: { _id: "$_id.courseId", activeStudents: { $sum: 1 } } },
    ]) as { _id: mongoose.Types.ObjectId; activeStudents: number }[];
    const videoMap = Object.fromEntries(videoStats.map((v: { _id: mongoose.Types.ObjectId; activeStudents: number }) => [v._id.toString(), v.activeStudents]));

    // Homework stats per course
    const hwStats = await HomeworkSubmission.aggregate([
      {
        $lookup: {
          from: "homeworks",
          localField: "homeworkId",
          foreignField: "_id",
          as: "hw",
        },
      },
      { $unwind: "$hw" },
      { $match: { "hw.courseId": { $in: courseIds } } },
      {
        $group: {
          _id: "$hw.courseId",
          submitted: { $sum: 1 },
          graded: { $sum: { $cond: [{ $eq: ["$status", "graded"] }, 1, 0] } },
          avgScore: { $avg: { $cond: [{ $eq: ["$status", "graded"] }, "$score", null] } },
        },
      },
    ]);
    const hwMap = Object.fromEntries(hwStats.map((h) => [h._id.toString(), h]));

    // Quiz stats per course
    const quizStats = await QuizAttempt.aggregate([
      { $match: { courseId: { $in: courseIds }, status: "submitted" } },
      {
        $group: {
          _id: "$courseId",
          attempts: { $sum: 1 },
          avgPct: { $avg: "$percentage" },
        },
      },
    ]);
    const quizMap = Object.fromEntries(quizStats.map((q) => [q._id.toString(), q]));

    // Attendance per course
    const attStats = await Attendance.aggregate([
      { $match: { courseId: { $in: courseIds } } },
      { $group: { _id: "$courseId", records: { $sum: 1 } } },
    ]);
    const attMap = Object.fromEntries(attStats.map((a) => [a._id.toString(), a.records]));

    // Homework count per course
    const hwCountArr = await Homework.aggregate([
      { $match: { courseId: { $in: courseIds } } },
      { $group: { _id: "$courseId", total: { $sum: 1 } } },
    ]);
    const hwCountMap = Object.fromEntries(hwCountArr.map((h) => [h._id.toString(), h.total]));

    // Quiz count per course
    const quizCountArr = await Quiz.aggregate([
      { $match: { courseId: { $in: courseIds } } },
      { $group: { _id: "$courseId", total: { $sum: 1 } } },
    ]);
    const quizCountMap = Object.fromEntries(quizCountArr.map((q) => [q._id.toString(), q.total]));

    // Total students
    const totalStudents = await User.countDocuments({ role: "student", status: "approved", ...tenantClause });

    const courseData = courses.map((c) => {
      const cid = c._id.toString();
      const enrolled   = enrollMap[cid]  ?? 0;
      const watching   = videoMap[cid]   ?? 0;
      const hw         = hwMap[cid];
      const quiz       = quizMap[cid];
      return {
        _id:          cid,
        title:        c.title,
        isActive:     c.isActive,
        enrolled,
        watchingRate: enrolled > 0 ? Math.round((watching / enrolled) * 100) : 0,
        hwCount:      hwCountMap[cid]  ?? 0,
        hwSubmitted:  hw?.submitted    ?? 0,
        hwGraded:     hw?.graded       ?? 0,
        hwAvgScore:   hw?.avgScore != null ? Math.round(hw.avgScore) : null,
        quizCount:    quizCountMap[cid] ?? 0,
        quizAttempts: quiz?.attempts   ?? 0,
        quizAvgPct:   quiz?.avgPct != null ? Math.round(quiz.avgPct) : null,
        attendance:   attMap[cid]      ?? 0,
      };
    });

    return NextResponse.json({ totalStudents, courses: courseData });
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
