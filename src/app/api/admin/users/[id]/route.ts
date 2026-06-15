import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { resolveInstitutionId, tenantFilter } from "@/lib/tenant";
import User from "@/models/User";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "admin" && auth.role !== "super_admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const institutionId = await resolveInstitutionId(req, auth.institutionId);

    const update: Record<string, unknown> = {};
    if (body.role !== undefined) {
      if (!["student", "teacher", "admin", "super_admin"].includes(body.role))
        return NextResponse.json({ error: "Role ไม่ถูกต้อง" }, { status: 400 });
      if (body.role === "super_admin" && auth.role !== "super_admin")
        return NextResponse.json({ error: "ไม่มีสิทธิ์กำหนด Super Admin" }, { status: 403 });
      update.role = body.role;
    }
    if (body.name !== undefined) update.name = body.name;
    if (body.email !== undefined) update.email = body.email;
    if (body.gradeLevel !== undefined) update.gradeLevel = body.gradeLevel;
    if (body.status !== undefined) update.status = body.status;
    if (body.profileImage !== undefined) update.profileImage = body.profileImage;
    if (body.password) {
      if (body.password.length < 6)
        return NextResponse.json({ error: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" }, { status: 400 });
      update.password = await bcrypt.hash(body.password, 10);
    }

    const user = await User.findOneAndUpdate(
      { _id: id, ...tenantFilter(institutionId) },
      update,
      { new: true }
    ).select("-password");
    if (!user) return NextResponse.json({ error: "ไม่พบผู้ใช้" }, { status: 404 });
    return NextResponse.json(JSON.parse(JSON.stringify(user)));
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "admin" && auth.role !== "super_admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const { id } = await params;
    if (auth.userId === id) return NextResponse.json({ error: "ไม่สามารถลบบัญชีตัวเองได้" }, { status: 400 });
    const institutionId = await resolveInstitutionId(_req, auth.institutionId);
    await User.findOneAndDelete({ _id: id, ...tenantFilter(institutionId) });
    return NextResponse.json({ message: "ลบผู้ใช้สำเร็จ" });
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
