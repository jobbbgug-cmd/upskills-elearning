import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { HomeworkSubmission } from "@/models/Homework";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const submissions = await HomeworkSubmission.find({
      studentId: auth.userId,
    })
      .select("-__v")
      .sort({ submittedAt: -1 })
      .lean();

    return NextResponse.json(submissions);
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
