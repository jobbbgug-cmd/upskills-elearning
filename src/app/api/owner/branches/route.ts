import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Institution from "@/models/Institution";

export async function GET() {
  const auth = await getAuthUser();
  if (!auth || !["admin", "owner", "super_admin"].includes(auth.role))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  // Include parent institution as first item (it's the main/HQ branch)
  const [parent, children] = await Promise.all([
    Institution.findById(auth.institutionId).select("_id name slug isActive").lean(),
    Institution.find({ parentId: auth.institutionId })
      .select("_id name slug isActive")
      .sort({ createdAt: 1 })
      .lean(),
  ]);

  const all = parent ? [parent, ...children] : children;
  return NextResponse.json(JSON.parse(JSON.stringify(all)));
}
