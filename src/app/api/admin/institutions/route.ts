import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import Institution from "@/models/Institution";

export async function GET() {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    if (!auth || auth.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const body = await req.json();
    const institution = await Institution.create(body);
    return NextResponse.json(JSON.parse(JSON.stringify(institution)), { status: 201 });
  } catch (err: unknown) {
    const code = (err as { code?: number }).code;
    if (code === 11000) return NextResponse.json({ error: "Slug นี้ถูกใช้งานแล้ว" }, { status: 400 });
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
