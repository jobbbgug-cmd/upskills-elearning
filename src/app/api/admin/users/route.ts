import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { resolveInstitutionId, tenantFilter } from "@/lib/tenant";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "admin" && auth.role !== "super_admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    if (!auth || auth.role !== "admin" && auth.role !== "super_admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name, email, password, role, gradeLevel, status, studentId, studentName } = await req.json();
    if (!name || !email || !password) return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบ" }, { status: 400 });
    if (!email.toLowerCase().endsWith("@gmail.com")) return NextResponse.json({ error: "อีเมลต้องเป็น @gmail.com เท่านั้น" }, { status: 400 });
    if (password.length < 6) return NextResponse.json({ error: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" }, { status: 400 });

    const allowedRoles = ["student", "teacher", "parent", "admin", "owner", "super_admin"];
    const userRole = allowedRoles.includes(role) ? role : "student";

    await connectDB();
    const existing = await User.findOne({ email });
    if (existing) return NextResponse.json({ error: "อีเมลนี้ถูกใช้งานแล้ว" }, { status: 400 });

    const institutionId = await resolveInstitutionId(req, auth.institutionId);
    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      institutionId: institutionId ?? undefined,
      name,
      email,
      password: hashed,
      role: userRole,
      gradeLevel: gradeLevel ?? (userRole === "student" || userRole === "parent" ? "" : "ทุกระดับชั้น"),
      studentId: userRole === "parent" ? (studentId ?? "") : "",
      studentName: userRole === "parent" ? (studentName ?? "") : "",
      status: status ?? "approved",
      contactChannel: "",
      contactId: "",
    });

    const { password: _, ...rest } = user.toObject();
    return NextResponse.json(JSON.parse(JSON.stringify(rest)), { status: 201 });
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
