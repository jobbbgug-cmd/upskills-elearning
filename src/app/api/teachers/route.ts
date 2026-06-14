import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { tenantFilter, getTenantId } from "@/lib/tenant";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const institutionId = await getTenantId(req);
    const teachers = await User.find({
      ...tenantFilter(institutionId),
      role: "teacher",
      status: "approved",
    })
      .select("_id name")
      .sort({ name: 1 })
      .lean();
    return NextResponse.json(JSON.parse(JSON.stringify(teachers)));
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}
