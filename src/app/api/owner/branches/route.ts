import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Institution from "@/models/Institution";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== "owner") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const parent = await Institution.findById(user.institutionId)
      .select("_id name isActive")
      .lean() as unknown as { _id: { toString(): string }; name: string; isActive: boolean } | null;

    if (!parent) {
      return NextResponse.json([], { status: 200 });
    }

    const children = await Institution.find({ parentId: user.institutionId })
      .select("_id name isActive")
      .sort({ createdAt: 1 })
      .lean() as unknown as Array<{ _id: { toString(): string }; name: string; isActive: boolean }>;

    const branches = [
      { _id: parent._id.toString(), name: `${parent.name} (หลัก)`, isActive: parent.isActive },
      ...children.map((b) => ({ _id: b._id.toString(), name: b.name, isActive: b.isActive })),
    ];

    return NextResponse.json(branches, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
