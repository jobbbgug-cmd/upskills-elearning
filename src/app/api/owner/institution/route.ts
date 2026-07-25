import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import Institution from "@/models/Institution";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "owner") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get owner's parent institution
    const institution = await Institution.findById(auth.institutionId).lean();
    if (!institution) {
      return NextResponse.json({ error: "ไม่พบสถาบัน" }, { status: 404 });
    }

    return NextResponse.json(JSON.parse(JSON.stringify(institution)));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
