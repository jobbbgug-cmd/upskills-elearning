import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { resolveInstitutionId, tenantFilter } from "@/lib/tenant";
import Review from "@/models/Review";
import Booking from "@/models/Booking";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const courseId = req.nextUrl.searchParams.get("courseId");
    if (!courseId) return NextResponse.json({ error: "courseId required" }, { status: 400 });
    const reviews = await Review.find({ courseId, isApproved: true })
      .populate("studentId", "name profileImage")
      .sort({ createdAt: -1 })
      .lean();
    const avg = reviews.reduce((s, r) => s + (r as unknown as { rating: number }).rating, 0) / (reviews.length || 1);
    return NextResponse.json({ reviews: JSON.parse(JSON.stringify(reviews)), avg: Math.round(avg * 10) / 10, total: reviews.length });
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "student") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const institutionId = await resolveInstitutionId(req, auth.institutionId);
    if (!institutionId) return NextResponse.json({ error: "ไม่พบสถาบัน" }, { status: 404 });
    const { courseId, rating, comment } = await req.json();
    if (!courseId || !rating) return NextResponse.json({ error: "กรุณาระบุคอร์สและคะแนน" }, { status: 400 });

    const enrolled = await Booking.exists({ userId: auth.userId, courseId, status: "confirmed", ...tenantFilter(institutionId) });
    if (!enrolled) return NextResponse.json({ error: "คุณยังไม่ได้ลงทะเบียนคอร์สนี้" }, { status: 403 });

    const review = await Review.findOneAndUpdate(
      { institutionId, courseId, studentId: auth.userId },
      { institutionId, courseId, studentId: auth.userId, rating: Math.min(5, Math.max(1, Number(rating))), comment: comment ?? "", isApproved: false },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return NextResponse.json(review);
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
