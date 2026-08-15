import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Institution from "@/models/Institution";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const parentId = req.nextUrl.searchParams.get("parentId");

    let institutions;
    if (parentId) {
      // Get branches of a parent institution
      institutions = await Institution.find({ parentId }).sort({ createdAt: -1 }).lean();
    } else {
      // Get all parent institutions (no parentId)
      institutions = await Institution.find({ parentId: null }).sort({ createdAt: -1 }).lean();
    }

    // Convert to JSON-serializable format
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

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching institutions:", error);
    return NextResponse.json({ error: "Failed to fetch institutions", details: String(error) }, { status: 500 });
  }
}
