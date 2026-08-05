import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import User from "@/models/User";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "super_admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const { id } = await params;

    const user = await User.findOne({ _id: id }).select("-password").lean();

    if (!user) return NextResponse.json({ error: "ไม่พบผู้ใช้" }, { status: 404 });
    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "super_admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const update: Record<string, unknown> = {};
    if (body.role !== undefined) {
      if (!["student", "teacher", "parent", "admin", "owner", "super_admin"].includes(body.role))
        return NextResponse.json({ error: "Role ไม่ถูกต้อง" }, { status: 400 });
      update.role = body.role;
    }
    if (body.name !== undefined) update.name = body.name;
    if (body.email !== undefined) {
      if (!body.email.toLowerCase().endsWith("@gmail.com"))
        return NextResponse.json({ error: "อีเมลต้องเป็น @gmail.com เท่านั้น" }, { status: 400 });
      update.email = body.email;
    }
    if (body.phone !== undefined) update.phone = body.phone;
    if (body.gradeLevel !== undefined) update.gradeLevel = body.gradeLevel;
    if (body.status !== undefined) update.status = body.status;
    if (body.profileImage !== undefined) update.profileImage = body.profileImage;
    if (body.studentId !== undefined) update.studentId = body.studentId;
    if (body.studentName !== undefined) update.studentName = body.studentName;
    if (body.institutionId !== undefined) {
      update.institutionId = body.institutionId || null;
    }
    if (body.password) {
      if (body.password.length < 6)
        return NextResponse.json({ error: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" }, { status: 400 });
      update.password = await bcrypt.hash(body.password, 10);
    }

    const user = await User.findByIdAndUpdate(id, update, { new: true }).select("-password");
    if (!user) return NextResponse.json({ error: "ไม่พบผู้ใช้" }, { status: 404 });
    return NextResponse.json(JSON.parse(JSON.stringify(user)));
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "super_admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const { id } = await params;
    if (auth.userId === id) return NextResponse.json({ error: "ไม่สามารถลบบัญชีตัวเองได้" }, { status: 400 });

    await User.findByIdAndDelete(id);
    return NextResponse.json({ message: "ลบผู้ใช้สำเร็จ" });
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
