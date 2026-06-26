import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { resolveInstitutionId, tenantFilter } from "@/lib/tenant";
import { ForumPost, ForumReply } from "@/models/Forum";
import Booking from "@/models/Booking";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const institutionId = await resolveInstitutionId(req, auth.institutionId);
    const courseId = req.nextUrl.searchParams.get("courseId");
    const filter: Record<string, unknown> = { ...tenantFilter(institutionId) };
    if (courseId) filter.courseId = courseId;

    const posts = await ForumPost.find(filter)
      .populate("authorId", "name profileImage role")
      .populate("courseId", "title")
      .sort({ isPinned: -1, createdAt: -1 })
      .lean() as unknown as Array<{
        _id: { toString(): string };
        upvotes: unknown[];
        [key: string]: unknown;
      }>;

    const postIds = posts.map((p) => p._id.toString());
    const replyCounts = await ForumReply.aggregate([
      { $match: { postId: { $in: posts.map((p) => p._id) } } },
      { $group: { _id: "$postId", count: { $sum: 1 } } },
    ]) as { _id: { toString(): string }; count: number }[];
    const replyMap = Object.fromEntries(replyCounts.map((r) => [r._id.toString(), r.count]));

    const result = posts.map((p) => ({
      ...p,
      replyCount: replyMap[p._id.toString()] ?? 0,
      upvoteCount: p.upvotes.length,
    }));

    void postIds;
    return NextResponse.json(JSON.parse(JSON.stringify(result)));
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const institutionId = await resolveInstitutionId(req, auth.institutionId);
    if (!institutionId) return NextResponse.json({ error: "ไม่พบสถาบัน" }, { status: 404 });
    const { courseId, title, body } = await req.json();
    if (!courseId || !title || !body)
      return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบ" }, { status: 400 });

    if (auth.role === "student") {
      const enrolled = await Booking.exists({ userId: auth.userId, courseId, status: "confirmed", ...tenantFilter(institutionId) });
      if (!enrolled) return NextResponse.json({ error: "คุณยังไม่ได้ลงทะเบียนคอร์สนี้" }, { status: 403 });
    }

    const post = await ForumPost.create({ institutionId, courseId, authorId: auth.userId, title, body });
    return NextResponse.json(post, { status: 201 });
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
