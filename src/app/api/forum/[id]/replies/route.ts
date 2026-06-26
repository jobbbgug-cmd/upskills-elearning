import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { resolveInstitutionId } from "@/lib/tenant";
import { ForumPost, ForumReply } from "@/models/Forum";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const institutionId = await resolveInstitutionId(req, auth.institutionId);
    if (!institutionId) return NextResponse.json({ error: "ไม่พบสถาบัน" }, { status: 404 });
    const { id } = await params;
    const { body } = await req.json();
    if (!body) return NextResponse.json({ error: "กรุณาระบุข้อความ" }, { status: 400 });
    const post = await ForumPost.exists({ _id: id });
    if (!post) return NextResponse.json({ error: "ไม่พบกระทู้" }, { status: 404 });
    const reply = await ForumReply.create({ institutionId, postId: id, authorId: auth.userId, body });
    await reply.populate("authorId", "name profileImage role");
    return NextResponse.json(reply, { status: 201 });
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
