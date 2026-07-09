import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Notification from "@/models/Notification";
import User from "@/models/User";
import { tenantFilter } from "@/lib/tenant";

// GET — get own notifications (with unread count)
export async function GET(req: NextRequest) {
  try {
    let auth;
    try {
      auth = await getAuthUser();
    } catch (authError) {
      console.error("getAuthUser error:", authError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const { searchParams } = new URL(req.url);
    const onlyUnread = searchParams.get("unread") === "1";

    const filter: Record<string, unknown> = { userId: auth.userId };
    if (onlyUnread) filter.isRead = false;

    const [notifications, unreadCount] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).limit(50).lean(),
      Notification.countDocuments({ userId: auth.userId, isRead: false }),
    ]);
    return NextResponse.json({ notifications: JSON.parse(JSON.stringify(notifications)), unreadCount });
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

// POST — admin sends notification to users
export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || (auth.role !== "admin" && auth.role !== "super_admin" && auth.role !== "teacher"))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const { title, body, link, type, targetRole, targetUserIds } = await req.json();
    if (!title) return NextResponse.json({ error: "กรุณาระบุหัวข้อ" }, { status: 400 });

    let userIds: string[] = [];
    if (Array.isArray(targetUserIds) && targetUserIds.length > 0) {
      userIds = targetUserIds;
    } else {
      const roleFilter = targetRole ? { role: targetRole } : { role: "student" };
      const filter = auth.institutionId
        ? { ...roleFilter, ...tenantFilter(auth.institutionId) }
        : roleFilter;
      const users = await User.find(filter).select("_id").lean() as { _id: { toString(): string } }[];
      userIds = users.map((u) => u._id.toString());
    }

    if (userIds.length === 0) return NextResponse.json({ error: "ไม่พบผู้ใช้ที่ต้องการส่ง" }, { status: 400 });

    await Notification.insertMany(
      userIds.map((uid) => ({ userId: uid, type: type ?? "announcement", title, body: body ?? "", link: link ?? undefined }))
    );
    return NextResponse.json({ ok: true, sent: userIds.length });
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

// PATCH — mark as read (all or specific ids)
export async function PATCH(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const { ids } = await req.json().catch(() => ({ ids: null }));
    const filter: Record<string, unknown> = { userId: auth.userId };
    if (Array.isArray(ids) && ids.length > 0) filter._id = { $in: ids };
    await Notification.updateMany(filter, { $set: { isRead: true } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
