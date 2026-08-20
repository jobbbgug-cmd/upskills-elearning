import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Certificate from "@/models/Certificate";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser();
    if (!auth || (auth.role !== "admin" && auth.role !== "super_admin" && auth.role !== "teacher-online" && auth.role !== "teacher_online" && auth.role !== "teacher"))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const { id } = await params;
    const cert = await Certificate.findById(id);
    if (!cert) return NextResponse.json({ error: "ไม่พบใบรับรอง" }, { status: 404 });

    if ((auth.role === "teacher-online" || auth.role === "teacher_online" || auth.role === "teacher") && cert.issuedBy.toString() !== auth.userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await Certificate.findByIdAndDelete(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser();
    if (!auth || (auth.role !== "admin" && auth.role !== "super_admin" && auth.role !== "teacher-online" && auth.role !== "teacher_online" && auth.role !== "teacher"))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const { id } = await params;
    const { title, description } = await req.json();

    const cert = await Certificate.findById(id);
    if (!cert) return NextResponse.json({ error: "ไม่พบใบรับรอง" }, { status: 404 });

    if ((auth.role === "teacher-online" || auth.role === "teacher_online" || auth.role === "teacher") && cert.issuedBy.toString() !== auth.userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const updated = await Certificate.findByIdAndUpdate(
      id,
      { title, description },
      { new: true }
    ).populate([
      { path: "studentId", select: "name" },
      { path: "courseId", select: "title" },
      { path: "issuedBy", select: "name" },
    ]);

    return NextResponse.json(JSON.parse(JSON.stringify(updated)));
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[PATCH /api/certificates/:id] Error:", errorMsg);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

// GET by code — public verification
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const cert = await Certificate.findOne({ code: id })
      .populate("studentId", "name")
      .populate("courseId",  "title")
      .populate("issuedBy",  "name institutionId")
      .lean();
    if (!cert) return NextResponse.json({ error: "ไม่พบใบรับรอง" }, { status: 404 });
    return NextResponse.json(JSON.parse(JSON.stringify(cert)));
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
