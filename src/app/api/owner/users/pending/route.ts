import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { connectDB } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { resolveInstitutionId, tenantFilter } from "@/lib/tenant";
import User from "@/models/User";
import Institution from "@/models/Institution";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || !["admin", "owner", "super_admin", "teacher"].includes(auth.role))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const institutionId = await resolveInstitutionId(req, auth.institutionId);

    // Get pending users from institution
    const pendingUsers = await User.find({ ...tenantFilter(institutionId), status: "pending" })
      .select("-password")
      .sort({ createdAt: 1 })
      .lean();

    // For owner role, also include pending users from child institutions
    if (auth.role === "owner" && institutionId) {
      const instId = typeof institutionId === "string" ? new ObjectId(institutionId) : institutionId;
      const childInstitutions = await Institution.find({ parentId: instId }).select("_id").lean();
      const childInstIds = childInstitutions.map(i => i._id);

      if (childInstIds.length > 0) {
        const childPendingUsers = await User.find({ institutionId: { $in: childInstIds }, status: "pending" })
          .select("-password")
          .sort({ createdAt: 1 })
          .lean();
        pendingUsers.push(...childPendingUsers);
      }
    }

    return NextResponse.json(JSON.parse(JSON.stringify(pendingUsers)));
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
