import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import mongoose from "mongoose";

const QuizAttemptSchema = new mongoose.Schema({
  quizId: mongoose.Schema.Types.ObjectId,
  studentId: mongoose.Schema.Types.ObjectId,
  score: Number,
  totalPoints: Number,
  percentage: Number,
  completedAt: Date,
});

const QuizAttempt = mongoose.models.QuizAttempt ||
  mongoose.model("QuizAttempt", QuizAttemptSchema);

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const attempts = await QuizAttempt.find({ studentId: auth.userId })
      .sort({ completedAt: -1 })
      .lean();

    return NextResponse.json(attempts || []);
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
