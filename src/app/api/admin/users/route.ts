import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import { connectDB } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { resolveInstitutionId, tenantFilter } from "@/lib/tenant";
import User from "@/models/User";
import Institution from "@/models/Institution";

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

    // Get users from admin's institution
    const institutionUsers = await User.find(filter).select("-password").sort({ createdAt: -1 }).lean();

    // For admin role, also include users from parent and child institutions
    if (auth.role === "admin" && institutionId) {
      const instId = typeof institutionId === "string" ? new ObjectId(institutionId) : institutionId;
      const allUsers = [...institutionUsers];

      // Get parent institution
      const currentInst = await Institution.findById(instId).lean();
      if (currentInst?.parentId) {
        const parentFilter = { institutionId: currentInst.parentId };
        if (roleParam) parentFilter.role = roleParam;
        const parentUsers = await User.find(parentFilter).select("-password").sort({ createdAt: -1 }).lean();
        allUsers.push(...parentUsers);
      }

      // Get child institutions
      const childInstitutions = await Institution.find({ parentId: instId }).select("_id").lean();
      const childInstIds = childInstitutions.map(i => i._id);

      if (childInstIds.length > 0) {
        const childFilter = { institutionId: { $in: childInstIds } };
        if (roleParam) childFilter.role = roleParam;
        const childUsers = await User.find(childFilter).select("-password").sort({ createdAt: -1 }).lean();
        allUsers.push(...childUsers);
      }

      return NextResponse.json(JSON.parse(JSON.stringify(allUsers)));
    }

    return NextResponse.json(JSON.parse(JSON.stringify(institutionUsers)));
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
