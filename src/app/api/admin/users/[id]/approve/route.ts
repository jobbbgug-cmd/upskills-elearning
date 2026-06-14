import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { resolveInstitutionId, tenantFilter } from "@/lib/tenant";
import { withinLimit } from "@/lib/planLimits";
import User from "@/models/User";
import Institution from "@/models/Institution";

function generatePassword(length = 10): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser();
    if (!auth || (auth.role !== "admin" && auth.role !== "teacher"))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { id } = await params;
    const institutionId = await resolveInstitutionId(_req, auth.institutionId);

    // Phase 4: plan limit check for student count
    if (institutionId) {
      const inst = await Institution.findById(institutionId).select("plan planExpiresAt isActive").lean() as {
        plan: string; planExpiresAt: Date | null; isActive: boolean;
      } | null;
      if (inst) {
        if (!inst.isActive)
          return NextResponse.json({ error: "สถาบันถูกระงับการใช้งาน" }, { status: 403 });
        if (inst.planExpiresAt && inst.planExpiresAt < new Date())
          return NextResponse.json({ error: "แผนสมาชิกหมดอายุแล้ว" }, { status: 403 });
        const studentCount = await User.countDocuments({ institutionId, role: "student", status: "approved" });
        if (!withinLimit(inst.plan as Parameters<typeof withinLimit>[0], "maxStudents", studentCount))
          return NextResponse.json({
            error: `แผน ${inst.plan} ถึงขีดจำกัดนักเรียนแล้ว กรุณาอัปเกรดแผน`,
          }, { status: 403 });
      }
    }

    const user = await User.findOne({ _id: id, ...tenantFilter(institutionId) });
    if (!user) return NextResponse.json({ error: "ไม่พบผู้ใช้" }, { status: 404 });

    const plainPassword = generatePassword();
    const hashed = await bcrypt.hash(plainPassword, 10);

    user.password = hashed;
    user.status = "approved";
    await user.save();

    return NextResponse.json({
      message: "อนุมัติสำเร็จ",
      password: plainPassword,
      user: { name: user.name, email: user.email, role: user.role },
    });
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
