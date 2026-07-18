import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { resolveInstitutionId, tenantFilter } from "@/lib/tenant";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || !["admin", "owner", "super_admin"].includes(auth.role)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const institutionId = await resolveInstitutionId(req, auth.institutionId);

    const filter: Record<string, unknown> = {};

    // Only add institutionId filter if it's provided
    if (institutionId) {
      filter.institutionId = institutionId;
    }

    // Add role filter if requested
    const roleParam = req.nextUrl.searchParams.get("role");
    if (roleParam) {
      filter.role = roleParam;
    }

    // If unassigned=true and role=student, exclude students already assigned to parents
    const unassignedParam = req.nextUrl.searchParams.get("unassigned");
    if (unassignedParam === "true" && roleParam === "student") {
      // Find all parents with assigned students
      const parentsWithStudents = await User.find({ role: "parent", studentId: { $exists: true, $ne: "" } }).select("studentId").lean();
      const assignedStudentIds = parentsWithStudents.map((p) => p.studentId);

      // Exclude those students from results
      filter._id = { $nin: assignedStudentIds };
    }

    const users = await User.find(filter).select("-password").sort({ createdAt: -1 }).lean();
    return NextResponse.json(JSON.parse(JSON.stringify(users)));
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || !["admin", "owner", "super_admin"].includes(auth.role)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const institutionId = await resolveInstitutionId(req, auth.institutionId);

    const { name, email, password, phone, role, status, gradeLevel, nickname } = await req.json();

    if (!name?.trim()) return NextResponse.json({ error: "กรุณาระบุชื่อ" }, { status: 400 });
    if (!email?.trim()) return NextResponse.json({ error: "กรุณาระบุอีเมล" }, { status: 400 });
    if (!password) return NextResponse.json({ error: "กรุณาระบุรหัสผ่าน" }, { status: 400 });
    if (!role) return NextResponse.json({ error: "กรุณาระบุบทบาท" }, { status: 400 });

    const exists = await User.findOne({ email: email.trim().toLowerCase() });
    if (exists) return NextResponse.json({ error: "อีเมลนี้ถูกใช้งานแล้ว" }, { status: 409 });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      institutionId: institutionId ?? undefined,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashed,
      phone: phone?.trim() ?? "",
      role: role || "student",
      status: status || "pending",
      gradeLevel: gradeLevel ?? "",
      nickname: nickname?.trim() ?? "",
    });

    const { password: _p, ...safe } = user.toObject();
    return NextResponse.json(JSON.parse(JSON.stringify(safe)), { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
