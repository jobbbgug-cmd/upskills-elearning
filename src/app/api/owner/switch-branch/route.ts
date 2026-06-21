import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Institution from "@/models/Institution";

export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth || !auth.isOwner)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { branchId } = await req.json();

  const res = NextResponse.json({ ok: true });

  if (!branchId || branchId === auth.institutionId) {
    // Switching to parent/HQ — clear activeBranchId so resolveInstitutionId uses parent
    res.cookies.set("activeBranchId", "", { maxAge: 0, path: "/" });
    return res;
  }

  // Validate the branch is a child of this owner's institution
  await connectDB();
  const branch = await Institution.findOne({ _id: branchId, parentId: auth.institutionId }).lean();
  if (!branch)
    return NextResponse.json({ error: "ไม่พบสาขา" }, { status: 404 });

  res.cookies.set("activeBranchId", branchId, { httpOnly: true, maxAge: 60 * 60 * 24 * 7, path: "/" });
  return res;
}
