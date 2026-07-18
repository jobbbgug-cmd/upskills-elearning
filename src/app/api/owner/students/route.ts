import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { resolveInstitutionId, tenantFilter } from "@/lib/tenant";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || !["admin", "owner", "teacher", "super_admin"].includes(auth.role))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const institutionId = await resolveInstitutionId(req, auth.institutionId);

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") ?? "";
    const group  = searchParams.get("group") ?? "";
    const grade  = searchParams.get("grade") ?? "";

    const filter: Record<string, unknown> = {
      ...tenantFilter(institutionId),
      role: "student",
    };
    if (search) filter.$or = [
      { name:  { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
    if (group) filter.groups = group;
    if (grade) filter.gradeLevel = grade;

    const students = await User.find(filter)
      .select("-password -documents")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(JSON.parse(JSON.stringify(students)));
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || !["admin", "owner", "super_admin"].includes(auth.role))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const institutionId = await resolveInstitutionId(req, auth.institutionId);
    const { name, email, password, phone, gradeLevel, groups, nickname } = await req.json();

    if (!name?.trim()) return NextResponse.json({ error: "กรุณาระบุชื่อ" }, { status: 400 });
    if (!email?.trim()) return NextResponse.json({ error: "กรุณาระบุอีเมล" }, { status: 400 });
    if (!password)      return NextResponse.json({ error: "กรุณาระบุรหัสผ่าน" }, { status: 400 });

    const exists = await User.findOne({ email: email.trim().toLowerCase() });
    if (exists) return NextResponse.json({ error: "อีเมลนี้ถูกใช้งานแล้ว" }, { status: 409 });

    const hashed = await bcrypt.hash(password, 10);
    const student = await User.create({
      institutionId: institutionId ?? undefined,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashed,
      role: "student",
      status: "approved",
      phone: phone?.trim() ?? "",
      gradeLevel: gradeLevel ?? "",
      nickname: nickname?.trim() ?? "",
      groups: Array.isArray(groups) ? groups.filter(Boolean) : [],
    });

    const { password: _p, ...safe } = student.toObject();
    return NextResponse.json(JSON.parse(JSON.stringify(safe)), { status: 201 });
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
