import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Institution from "@/models/Institution";

export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth || !auth.isOwner)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { branchId } = await req.json();

  if (branchId) {
    // Validate the branch belongs to this owner's institution
    await connectDB();
    const branch = await Institution.findOne({ _id: branchId, parentId: auth.institutionId }).lean();
    if (!branch)
      return NextResponse.json({ error: "ไม่พบสาขา" }, { status: 404 });
  }

  const res = NextResponse.json({ ok: true });
  if (branchId) {
    res.cookies.set("activeBranchId", branchId, { httpOnly: true, maxAge: 60 * 60 * 24 * 7, path: "/" });
  } else {
    res.cookies.set("activeBranchId", "", { maxAge: 0, path: "/" });
  }
  return res;
}
