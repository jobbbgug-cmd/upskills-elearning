import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    let auth;
    try {
      auth = await getAuthUser();
    } catch {
      auth = null;
    }
    if (!auth || auth.role !== "super_admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { searchParams } = new URL(req.url);
    const institutionId = searchParams.get("institutionId");
    const role = searchParams.get("role");
    const status = searchParams.get("status");

    const filter: Record<string, any> = {};

    // Filter by institutionId if provided
    if (institutionId && institutionId !== "all") {
      filter.institutionId = typeof institutionId === "string" ? new ObjectId(institutionId) : institutionId;
    }

    // Filter by role if provided
    if (role && role !== "all") {
      filter.role = role;
    }

    // Filter by status if provided
    if (status && status !== "all") {
      filter.status = status;
    }

    // Super-admin should see all users from all institutions
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .lean() as any[];

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "super_admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name, email, password, role, gradeLevel, status, studentId, studentName, institutionId } = await req.json();
    if (!name || !email || !password) return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบ" }, { status: 400 });
    if (!email.toLowerCase().endsWith("@gmail.com")) return NextResponse.json({ error: "อีเมลต้องเป็น @gmail.com เท่านั้น" }, { status: 400 });
    if (password.length < 6) return NextResponse.json({ error: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" }, { status: 400 });

    const allowedRoles = ["student", "teacher", "parent", "admin", "owner", "super_admin"];
    const userRole = allowedRoles.includes(role) ? role : "student";

    await connectDB();
    const existing = await User.findOne({ email });
    if (existing) return NextResponse.json({ error: "อีเมลนี้ถูกใช้งานแล้ว" }, { status: 400 });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      institutionId: institutionId ? new ObjectId(institutionId) : undefined,
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
