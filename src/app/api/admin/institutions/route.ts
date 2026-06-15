import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import Institution from "@/models/Institution";
import User from "@/models/User";

export async function GET() {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "admin" && auth.role !== "super_admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const institutions = await Institution.find().sort({ createdAt: 1 }).lean();
    return NextResponse.json(JSON.parse(JSON.stringify(institutions)));
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "admin" && auth.role !== "super_admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();

    const { adminName, adminEmail, adminPassword, ...institutionFields } = await req.json();

    // Validate admin fields if provided
    if (adminEmail) {
      const existing = await User.findOne({ email: adminEmail });
      if (existing) return NextResponse.json({ error: "อีเมล Admin นี้ถูกใช้งานแล้ว" }, { status: 400 });
      if (!adminName) return NextResponse.json({ error: "กรุณากรอกชื่อ Admin" }, { status: 400 });
      if (!adminPassword || adminPassword.length < 6) return NextResponse.json({ error: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" }, { status: 400 });
    }

    const institution = await Institution.create(institutionFields);
    const institutionId = (institution._id as { toString(): string }).toString();

    let adminUser = null;
    if (adminEmail && adminName && adminPassword) {
      const hashed = await bcrypt.hash(adminPassword, 10);
      const created = await User.create({
        institutionId,
        name: adminName,
        email: adminEmail,
        password: hashed,
        role: "admin",
        gradeLevel: "ทุกระดับชั้น",
        status: "approved",
        contactChannel: "",
        contactId: "",
      });
      const { password: _pw, ...rest } = created.toObject();
      adminUser = JSON.parse(JSON.stringify(rest));
    }

    return NextResponse.json(
      { institution: JSON.parse(JSON.stringify(institution)), adminUser },
      { status: 201 }
    );
  } catch (err: unknown) {
    const code = (err as { code?: number }).code;
    if (code === 11000) return NextResponse.json({ error: "Slug นี้ถูกใช้งานแล้ว" }, { status: 400 });
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
