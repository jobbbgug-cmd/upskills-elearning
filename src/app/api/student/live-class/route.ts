import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import LiveSession from "@/models/LiveSession";
import Course from "@/models/Course";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || (auth.role !== "student" && auth.role !== "parent")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const sessions = await LiveSession.find()
      .populate("courseId", "title")
      .sort({ scheduledAt: -1 })
      .lean();

    const result = sessions.map((s: any) => ({
      _id: s._id,
      title: s.title,
      description: s.description,
      scheduledAt: s.scheduledAt,
      duration: s.duration,
      status: s.status,
      meetLink: s.meetLink,
      replayLink: s.replayLink,
      courseId: s.courseId?._id,
      courseName: s.courseId?.title,
      createdBy: s.createdBy,
    }));

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
