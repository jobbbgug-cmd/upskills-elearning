import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { ForumPost, ForumReply } from "@/models/Forum";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const { id } = await params;
    const post = await ForumPost.findById(id)
      .populate("authorId", "name profileImage role")
      .populate("courseId", "title")
      .lean();
    if (!post) return NextResponse.json({ error: "ไม่พบกระทู้" }, { status: 404 });
    const replies = await ForumReply.find({ postId: id })
      .populate("authorId", "name profileImage role")
      .sort({ createdAt: 1 })
      .lean();
    return NextResponse.json({ post: JSON.parse(JSON.stringify(post)), replies: JSON.parse(JSON.stringify(replies)) });
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const post = await ForumPost.findById(id);
    if (!post) return NextResponse.json({ error: "ไม่พบกระทู้" }, { status: 404 });

    const isAdmin = auth.role === "admin" || auth.role === "super_admin" || auth.role === "teacher";
    const isAuthor = post.authorId.toString() === auth.userId;

    if ("isPinned" in body || "isResolved" in body) {
      if (!isAdmin && !isAuthor) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    } else if (!isAdmin && !isAuthor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const update: Record<string, unknown> = {};
    if ("isPinned"   in body) update.isPinned   = body.isPinned;
    if ("isResolved" in body) update.isResolved = body.isResolved;
    if ("title"      in body && isAuthor) update.title = body.title;
    if ("body"       in body && isAuthor) update.body  = body.body;

    const updated = await ForumPost.findByIdAndUpdate(id, update, { new: true });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const { id } = await params;
    const post = await ForumPost.findById(id);
    if (!post) return NextResponse.json({ error: "ไม่พบกระทู้" }, { status: 404 });
    const isAdmin = auth.role === "admin" || auth.role === "super_admin";
    const isAuthor = post.authorId.toString() === auth.userId;
    if (!isAdmin && !isAuthor) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    await Promise.all([ForumPost.findByIdAndDelete(id), ForumReply.deleteMany({ postId: id })]);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
