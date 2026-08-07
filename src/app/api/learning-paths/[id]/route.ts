import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthUser();
    if (!auth || (auth.role !== "admin" && auth.role !== "owner")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    const path = await LearningPath.findByIdAndDelete(id);

    if (!path) {
      return NextResponse.json({ error: "ไม่พบเส้นทาง" }, { status: 404 });
    }

    return NextResponse.json({ message: "ลบสำเร็จ" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthUser();
    if (!auth || (auth.role !== "admin" && auth.role !== "owner")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const { title, description, difficulty, estimatedHours, price, discount, courseIds } = await req.json();

    if (!title?.trim() || !description?.trim()) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const path = await LearningPath.findByIdAndUpdate(
      id,
      {
        title,
        description,
        difficulty: difficulty || "beginner",
        estimatedHours: estimatedHours || 0,
        price: price || 0,
        discount: discount || 0,
        courses: courseIds || [],
      },
      { new: true }
    );

    if (!path) {
      return NextResponse.json({ error: "ไม่พบเส้นทาง" }, { status: 404 });
    }

    return NextResponse.json({ path });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
