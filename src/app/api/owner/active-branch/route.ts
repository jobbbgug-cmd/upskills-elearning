import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth || !["admin", "owner", "super_admin"].includes(auth.role))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const activeBranchId = req.cookies.get("activeBranchId")?.value || null;
  return NextResponse.json({ activeBranchId });
}
