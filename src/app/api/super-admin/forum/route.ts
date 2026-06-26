import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { ForumPost, ForumReply } from "@/models/Forum";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "super_admin")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();

    const institutionId = req.nextUrl.searchParams.get("institutionId");
    const filter: Record<string, unknown> = {};
    if (institutionId) filter.institutionId = institutionId;

    const posts = await ForumPost.find(filter)
      .populate("institutionId", "name slug")
      .populate("authorId",      "name role")
      .populate("courseId",      "title")
      .sort({ createdAt: -1 })
      .lean() as unknown as Array<{ _id: { toString(): string }; upvotes: unknown[]; [key: string]: unknown }>;

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

    return NextResponse.json(JSON.parse(JSON.stringify(result)));
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
