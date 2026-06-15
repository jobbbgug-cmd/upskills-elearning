import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { resolveInstitutionId, tenantFilter } from "@/lib/tenant";
import CourseContent from "@/models/CourseContent";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser();
    if (!auth || (auth.role !== "admin" && auth.role !== "super_admin" && auth.role !== "teacher")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    await connectDB();
    const institutionId = await resolveInstitutionId(req, auth.institutionId);
    const content = await CourseContent.findOne({ _id: id, ...tenantFilter(institutionId) }).lean();
    if (!content) return NextResponse.json({ error: "ไม่พบชุดเนื้อหา" }, { status: 404 });
    return NextResponse.json({ content });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser();
    if (!auth || (auth.role !== "admin" && auth.role !== "super_admin" && auth.role !== "teacher")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const body = await req.json();
    await connectDB();
    const institutionId = await resolveInstitutionId(req, auth.institutionId);
    const content = await CourseContent.findOneAndUpdate(
      { _id: id, ...tenantFilter(institutionId) },
      body,
      { new: true, runValidators: true }
    );
    if (!content) return NextResponse.json({ error: "ไม่พบชุดเนื้อหา" }, { status: 404 });
    revalidatePath("/admin/content");
    return NextResponse.json({ content });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "admin" && auth.role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    await connectDB();
    const institutionId = await resolveInstitutionId(req, auth.institutionId);
    await CourseContent.findOneAndDelete({ _id: id, ...tenantFilter(institutionId) });
    revalidatePath("/admin/content");
    return NextResponse.json({ message: "ลบสำเร็จ" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
