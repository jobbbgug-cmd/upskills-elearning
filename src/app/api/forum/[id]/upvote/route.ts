import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { ForumPost } from "@/models/Forum";
import mongoose from "mongoose";

export async function PATCH(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const { id } = await params;
    const userId = new mongoose.Types.ObjectId(auth.userId);
    const post = await ForumPost.findById(id);
    if (!post) return NextResponse.json({ error: "ไม่พบกระทู้" }, { status: 404 });
    const hasUpvoted = post.upvotes.some((u) => u.toString() === auth.userId);
    if (hasUpvoted) {
      await ForumPost.findByIdAndUpdate(id, { $pull: { upvotes: userId } });
    } else {
      await ForumPost.findByIdAndUpdate(id, { $addToSet: { upvotes: userId } });
    }
    return NextResponse.json({ upvoted: !hasUpvoted });
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
