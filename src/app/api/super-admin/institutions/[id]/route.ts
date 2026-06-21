import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Institution from "@/models/Institution";
import User from "@/models/User";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "super_admin")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await connectDB();

    const institution = await Institution.findById(id);
    if (!institution)
      return NextResponse.json({ error: "ไม่พบสถาบัน" }, { status: 404 });

    // Find all branch institutions (children)
    const branches = await Institution.find({ parentId: id }).select("_id").lean();
    const branchIds = branches.map((b) => (b._id as { toString(): string }).toString());
    const allIds = [id, ...branchIds];

    // Delete users belonging to this institution and all its branches
    await User.deleteMany({ institutionId: { $in: allIds } });

    // Delete branch institutions
    if (branchIds.length > 0) {
      await Institution.deleteMany({ parentId: id });
    }

    // Delete the institution itself
    await Institution.findByIdAndDelete(id);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
