import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import FinanceSetting from "@/models/FinanceSetting";

export async function GET() {
  try {
    await connectDB();
    const setting = await FinanceSetting.findOne().lean();
    return NextResponse.json(setting ?? {});
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
