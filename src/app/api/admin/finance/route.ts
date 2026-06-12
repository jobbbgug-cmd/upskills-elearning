import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import FinanceSetting from "@/models/FinanceSetting";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const setting = await FinanceSetting.findOne().lean();
    return NextResponse.json(setting ?? {});
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const body = await req.json();
    const setting = await FinanceSetting.findOneAndUpdate(
      {},
      { $set: body },
      { new: true, upsert: true }
    );
    return NextResponse.json(JSON.parse(JSON.stringify(setting)));
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
