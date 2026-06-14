import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { resolveInstitutionId, tenantFilter } from "@/lib/tenant";
import { withinLimit } from "@/lib/planLimits";
import Course from "@/models/Course";
import Institution from "@/models/Institution";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || (auth.role !== "admin" && auth.role !== "teacher")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const institutionId = await resolveInstitutionId(req, auth.institutionId);
    const base = tenantFilter(institutionId);
    const filter = auth.role === "admin" ? base : { ...base, instructorId: auth.userId };
    const courses = await Course.find(filter).sort({ createdAt: -1 });
    return NextResponse.json({ courses });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || (auth.role !== "admin" && auth.role !== "teacher")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    await connectDB();
    const institutionId = await resolveInstitutionId(req, auth.institutionId);

    // Phase 4: plan limit check
    if (institutionId) {
      const inst = await Institution.findById(institutionId).select("plan planExpiresAt isActive").lean() as {
        plan: string; planExpiresAt: Date | null; isActive: boolean;
      } | null;
      if (inst) {
        if (!inst.isActive)
          return NextResponse.json({ error: "สถาบันถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ" }, { status: 403 });
        if (inst.planExpiresAt && inst.planExpiresAt < new Date())
          return NextResponse.json({ error: "แผนสมาชิกหมดอายุแล้ว กรุณาต่ออายุก่อนสร้างคอร์สใหม่" }, { status: 403 });
        const courseCount = await Course.countDocuments({ institutionId });
        if (!withinLimit(inst.plan as Parameters<typeof withinLimit>[0], "maxCourses", courseCount))
          return NextResponse.json({
            error: `แผน ${inst.plan} ของคุณถึงขีดจำกัดแล้ว ไม่สามารถสร้างคอร์สเพิ่มได้ กรุณาอัปเกรดแผน`,
          }, { status: 403 });
      }
    }

    if (auth.role === "teacher") {
      body.instructorId = auth.userId;
      body.instructor = auth.name;
    }
    if (institutionId) body.institutionId = institutionId;

    const course = await Course.create(body);
    return NextResponse.json({ course }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
