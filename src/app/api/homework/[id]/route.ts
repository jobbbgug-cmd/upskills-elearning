import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Homework } from "@/models/Homework";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const { id } = await params;
    const hw = await Homework.findById(id).populate("courseId", "title").populate("createdBy", "name").lean();
    if (!hw) return NextResponse.json({ error: "ไม่พบการบ้าน" }, { status: 404 });
    return NextResponse.json(JSON.parse(JSON.stringify(hw)));
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser();
    if (!auth || (auth.role !== "admin" && auth.role !== "teacher" && auth.role !== "super_admin"))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const allowed = ["title", "description", "dueDate", "maxScore", "attachments", "isActive"];
    const update: Record<string, unknown> = {};
    for (const k of allowed) if (body[k] !== undefined) update[k] = body[k];
    if (update.dueDate) update.dueDate = new Date(update.dueDate as string);
    const hw = await Homework.findByIdAndUpdate(id, update, { new: true });
    if (!hw) return NextResponse.json({ error: "ไม่พบการบ้าน" }, { status: 404 });
    return NextResponse.json(JSON.parse(JSON.stringify(hw)));
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser();
    if (!auth || (auth.role !== "admin" && auth.role !== "super_admin"))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const { id } = await params;
    await Homework.findByIdAndDelete(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
