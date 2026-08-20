import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { resolveInstitutionId, tenantFilter } from "@/lib/tenant";
import CourseContent from "@/models/CourseContent";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || (auth.role !== "admin" && auth.role !== "super_admin" && auth.role !== "teacher" && auth.role !== "teacher-online" && auth.role !== "teacher_online")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectDB();
    const institutionId = await resolveInstitutionId(req, auth.institutionId);
    const baseFilter = tenantFilter(institutionId);
    const filter = (auth.role === "teacher" || auth.role === "teacher-online" || auth.role === "teacher_online")
      ? { ...baseFilter, createdBy: auth.userId }
      : baseFilter;
    const contents = await CourseContent.find(filter)
      .sort({ createdAt: -1 })
      .select("_id name description type institutionId createdBy createdAt");
    return NextResponse.json({ contents });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    console.log("[POST /api/admin/content] Auth object:", JSON.stringify(auth));
    if (!auth || (auth.role !== "admin" && auth.role !== "super_admin" && auth.role !== "teacher" && auth.role !== "teacher-online" && auth.role !== "teacher_online")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    await connectDB();
    const institutionId = await resolveInstitutionId(req, auth.institutionId);
    if (institutionId) body.institutionId = institutionId;
    body.createdBy = auth.userId;
    console.log("[POST /api/admin/content] About to create - auth.userId:", auth.userId, "body.createdBy:", body.createdBy);
    const content = await CourseContent.create(body);
    console.log("[POST /api/admin/content] Created doc:", { _id: content._id.toString(), createdBy: content.createdBy, name: content.name });
    return NextResponse.json({ content }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/admin/content] Error:", err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
