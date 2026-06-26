import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import VideoProgress from "@/models/VideoProgress";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json([], { status: 401 });
  await connectDB();
  const { courseId } = await params;
  const records = await VideoProgress.find({ userId: auth.userId, courseId }).select("section clipIndex").lean();
  return NextResponse.json(records);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const { courseId } = await params;
  const { section, clipIndex } = await req.json();
  await VideoProgress.updateOne(
    { userId: auth.userId, courseId, section, clipIndex },
    { $set: { watchedAt: new Date() } },
    { upsert: true }
  );
  return NextResponse.json({ ok: true });
}
