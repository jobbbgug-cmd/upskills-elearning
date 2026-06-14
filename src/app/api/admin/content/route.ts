import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { resolveInstitutionId, tenantFilter } from "@/lib/tenant";
import CourseContent from "@/models/CourseContent";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || (auth.role !== "admin" && auth.role !== "teacher")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectDB();
    const institutionId = await resolveInstitutionId(req, auth.institutionId);
    const contents = await CourseContent.find(tenantFilter(institutionId))
      .sort({ createdAt: -1 })
      .select("_id name description createdAt");
    return NextResponse.json({ contents });
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
    if (institutionId) body.institutionId = institutionId;
    const content = await CourseContent.create(body);
    return NextResponse.json({ content }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
