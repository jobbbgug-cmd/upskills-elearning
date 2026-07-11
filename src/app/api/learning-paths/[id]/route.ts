import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import LearningPath from "@/models/LearningPath";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const path = await LearningPath.findById(id).populate({
      path: "courses",
      select: "title slug thumbnail instructorName",
    });

    if (!path) {
      return NextResponse.json({ error: "ไม่พบเส้นทาง" }, { status: 404 });
    }

    return NextResponse.json({ path });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
