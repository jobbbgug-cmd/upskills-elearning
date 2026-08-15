import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Institution from "@/models/Institution";

export async function GET(req: NextRequest) {
  try {
    console.log("[super-admin/institutions] Starting request...");

    const auth = await getAuthUser();
    console.log("[super-admin/institutions] Auth:", auth?.role);

    if (!auth || auth.role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[super-admin/institutions] Connecting to DB...");
    await connectDB();

    const parentId = req.nextUrl.searchParams.get("parentId");
    console.log("[super-admin/institutions] parentId:", parentId);

    let institutions;
    try {
      if (parentId) {
        institutions = await Institution.find({ parentId }).sort({ createdAt: -1 }).lean();
      } else {
        institutions = await Institution.find({ parentId: null }).sort({ createdAt: -1 }).lean();
      }
      console.log("[super-admin/institutions] Found institutions:", institutions.length);
    } catch (dbError) {
      console.error("[super-admin/institutions] DB query error:", dbError);
      return NextResponse.json({
        error: "Database query failed",
        details: String(dbError)
      }, { status: 500 });
    }

    const result = institutions.map((inst: any) => ({
      _id: String(inst._id ?? ""),
      name: inst.name ?? "",
      slug: inst.slug ?? "",
      email: inst.email ?? "",
      phone: inst.phone ?? "",
      status: inst.status ?? "active",
      createdAt: inst.createdAt ? new Date(inst.createdAt).toISOString() : "",
      plan: inst.plan ?? "basic",
    }));

    console.log("[super-admin/institutions] Returning result with", result.length, "institutions");
    return NextResponse.json(result);
  } catch (error) {
    console.error("[super-admin/institutions] Unexpected error:", error);
    return NextResponse.json({
      error: "Failed to fetch institutions",
      details: String(error)
    }, { status: 500 });
  }
}
