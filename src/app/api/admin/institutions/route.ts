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

    const { ownerName, ownerEmail, ownerPassword, branchCount, ...institutionFields } = await req.json();

    // Owner is required
    if (!ownerName || !ownerEmail || !ownerPassword)
      return NextResponse.json({ error: "กรุณากรอกข้อมูลเจ้าของสถาบันให้ครบถ้วน" }, { status: 400 });
    if (ownerPassword.length < 6)
      return NextResponse.json({ error: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" }, { status: 400 });

    const existing = await User.findOne({ email: ownerEmail });
    if (existing) return NextResponse.json({ error: "อีเมลนี้ถูกใช้งานแล้ว" }, { status: 400 });

    // Create parent institution
    const institution = await Institution.create({ ...institutionFields, parentId: null });
    const institutionId = (institution._id as { toString(): string }).toString();

    // Create branch institutions — parent counts as branch 1, so loop from 2
    // branchCount=3 → parent + สาขา 2 + สาขา 3 = 3 total
    const count = Math.max(1, Math.min(10, Number(branchCount) || 1));
    const branches = [];
    for (let i = 2; i <= count; i++) {
      const branch = await Institution.create({
        ...institutionFields,
        name: `${institutionFields.name} สาขา ${i}`,
        slug: `${institutionFields.slug}-branch-${i}`,
        parentId: institutionId,
      });
      branches.push(JSON.parse(JSON.stringify(branch)));
    }

    // branchCount=1 → single institution, no branch switching needed → create admin
    // branchCount>1 → multi-branch, needs owner role to switch between branches
    const userRole = count > 1 ? "owner" : "admin";
    const hashed = await bcrypt.hash(ownerPassword, 10);
    const ownerUser = await User.create({
      institutionId,
      name: ownerName,
      email: ownerEmail,
      password: hashed,
      role: userRole,
      gradeLevel: "ทุกระดับชั้น",
      status: "approved",
      contactChannel: "",
      contactId: "",
    });
    const { password: _pw, ...ownerRest } = ownerUser.toObject();

    return NextResponse.json(
      {
        institution: JSON.parse(JSON.stringify(institution)),
        branches,
        ownerUser: JSON.parse(JSON.stringify(ownerRest)),
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const code = (err as { code?: number }).code;
    if (code === 11000) return NextResponse.json({ error: "Slug นี้ถูกใช้งานแล้ว" }, { status: 400 });
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
