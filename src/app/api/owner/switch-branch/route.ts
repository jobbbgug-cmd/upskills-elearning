import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== "owner") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { branchId } = await req.json();
    if (!branchId) {
      return NextResponse.json({ error: "branchId required" }, { status: 400 });
    }

    const res = NextResponse.json({ success: true });
    res.cookies.set("selectedBranchId", branchId, { httpOnly: false, path: "/" });

    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
