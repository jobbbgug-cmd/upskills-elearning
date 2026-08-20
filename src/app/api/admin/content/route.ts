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
    console.log("[GET /api/admin/content] Filter:", JSON.stringify(filter), "userId:", auth.userId, "role:", auth.role);
    const contents = await CourseContent.find(filter)
      .sort({ createdAt: -1 })
      .select("_id name description type institutionId createdBy createdAt");
    console.log("[GET /api/admin/content] Found", contents.length, "contents with filter");

    // Debug: also check all content
    const allContents = await CourseContent.find({})
      .sort({ createdAt: -1 })
      .select("_id name createdBy");
    console.log("[GET /api/admin/content] Total content in DB:", allContents.length);
    allContents.forEach(c => console.log("  - id:", c._id, "createdBy:", c.createdBy));
    return NextResponse.json({ contents });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || (auth.role !== "admin" && auth.role !== "super_admin" && auth.role !== "teacher" && auth.role !== "teacher-online" && auth.role !== "teacher_online")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    await connectDB();
    const institutionId = await resolveInstitutionId(req, auth.institutionId);
    if (institutionId) body.institutionId = institutionId;
    if (auth.role === "teacher" || auth.role === "teacher-online" || auth.role === "teacher_online") {
      body.createdBy = auth.userId;
    }
    console.log("[POST /api/admin/content] Creating content with createdBy:", body.createdBy, "userId:", auth.userId, "role:", auth.role);
    const content = await CourseContent.create(body);
    console.log("[POST /api/admin/content] Created content:", content._id, "with createdBy:", content.createdBy);
    return NextResponse.json({ content }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
