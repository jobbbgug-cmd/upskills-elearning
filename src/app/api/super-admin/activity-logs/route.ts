import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import ActivityLog from "@/models/ActivityLog";
import Institution from "@/models/Institution";

export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth || (auth.role !== "super_admin" && auth.role !== "admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const { searchParams } = new URL(req.url);
  const page     = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit    = Math.min(100, parseInt(searchParams.get("limit") ?? "50"));
  const role     = searchParams.get("role") ?? "";
  const action   = searchParams.get("action") ?? "";
  const userId   = searchParams.get("userId") ?? "";
  const dateFrom = searchParams.get("dateFrom") ?? "";
  const dateTo   = searchParams.get("dateTo") ?? "";

  const filter: Record<string, unknown> = {};

  // Admin can only see logs for their institution, and cannot see guest (public) logs
  if (auth.role === "admin") {
    filter.userRole = { $ne: "guest" };
    if (auth.institutionId) filter.institutionId = auth.institutionId;
  }

  // Only super_admin can filter/view guest role
  if (role && !(role === "guest" && auth.role !== "super_admin")) {
    filter.userRole = role;
  }
  if (action) filter.action   = action;
  if (userId) filter.userId   = userId;

  if (dateFrom || dateTo) {
    const dateFilter: Record<string, Date> = {};
    if (dateFrom) dateFilter.$gte = new Date(dateFrom);
    if (dateTo)   dateFilter.$lte = new Date(new Date(dateTo).setHours(23, 59, 59, 999));
    filter.createdAt = dateFilter;
  }

  const [logs, total] = await Promise.all([
    ActivityLog.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    ActivityLog.countDocuments(filter),
  ]);

  // Attach institution names for logs that have institutionId but no institutionName
  const missingInstIds = [...new Set(
    logs
      .filter((l) => l.institutionId && !l.institutionName)
      .map((l) => l.institutionId!)
  )];
  const instNameMap = new Map<string, string>();
  if (missingInstIds.length > 0) {
    const insts = await Institution.find({ _id: { $in: missingInstIds } }).select("_id name").lean() as unknown as Array<{ _id: unknown; name: string }>;
    insts.forEach((i) => instNameMap.set((i._id as { toString(): string }).toString(), i.name));
  }

  const result = logs.map((l) => ({
    _id:             (l._id as { toString(): string }).toString(),
    userId:          l.userId,
    userName:        l.userName,
    userEmail:       l.userEmail,
    userRole:        l.userRole,
    institutionId:   l.institutionId ?? null,
    institutionName: l.institutionName ?? instNameMap.get(l.institutionId ?? "") ?? null,
    action:          l.action,
    description:     l.description,
    metadata:        l.metadata ?? null,
    ipAddress:       l.ipAddress ?? null,
    createdAt:       (l.createdAt as Date).toISOString(),
  }));

  return NextResponse.json({ logs: result, total, page, limit, isSuperAdmin: auth.role === "super_admin" });
}
