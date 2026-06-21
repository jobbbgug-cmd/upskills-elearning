import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Institution from "@/models/Institution";

export async function GET() {
  const auth = await getAuthUser();
  if (!auth || !auth.isOwner)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const branches = await Institution.find({ parentId: auth.institutionId })
    .select("_id name slug isActive")
    .sort({ createdAt: 1 })
    .lean();

  return NextResponse.json(JSON.parse(JSON.stringify(branches)));
}
