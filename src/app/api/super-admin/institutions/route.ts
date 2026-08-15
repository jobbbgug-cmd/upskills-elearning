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

    // Return empty array with timeout protection
    const institutions = await Promise.race([
      Institution.find({}).select("_id name slug email phone status plan createdAt").lean(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Query timeout")), 5000)
      )
    ]) as any[];

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
    console.error("[institutions] Error:", error instanceof Error ? error.message : error);
    // Return empty array on error instead of 500
    return NextResponse.json([]);
  }
}
