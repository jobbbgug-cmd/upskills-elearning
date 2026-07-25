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
    const parent = await Institution.findById(auth.institutionId).lean();
    if (!parent) {
      return NextResponse.json([]);
    }

    // Get owner's branches (children institutions)
    const branches = await Institution.find({ parentId: auth.institutionId }).lean();

    // Format response: each institution has parentName for display
    const institutions = [
      { ...parent, parentName: parent.name },
      ...branches.map(b => ({ ...b, parentName: parent.name }))
    ];

    return NextResponse.json(JSON.parse(JSON.stringify(institutions)));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
