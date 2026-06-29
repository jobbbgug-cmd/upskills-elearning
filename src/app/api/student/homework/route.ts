import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { Homework } from "@/models/Homework";
import Course from "@/models/Course";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || (auth.role !== "student" && auth.role !== "parent")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const studentId = auth.role === "parent" ? null : auth.userId;
    const query: Record<string, any> = { isActive: true };
    if (auth.institutionId) {
      query.institutionId = auth.institutionId;
    }

    // Get all homework for the user's institution
    const homeworks = await Homework.find(query)
      .populate("courseId", "title")
      .sort({ dueDate: -1 })
      .lean();

    const result = homeworks.map((hw: any) => ({
      _id: hw._id,
      title: hw.title,
      description: hw.description,
      dueDate: hw.dueDate,
      maxScore: hw.maxScore,
      courseId: hw.courseId?._id,
      courseName: hw.courseId?.title,
    }));

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
