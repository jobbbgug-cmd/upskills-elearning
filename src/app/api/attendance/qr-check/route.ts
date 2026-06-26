import { NextRequest, NextResponse } from "next/server";
import { jwtVerify, SignJWT } from "jose";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Attendance from "@/models/Attendance";

const QR_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET! + "_qr_attendance"
);

// Generate QR token (admin/teacher)
export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth || (auth.role !== "admin" && auth.role !== "teacher" && auth.role !== "super_admin"))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { courseId, sessionId, institutionId } = await req.json();
  if (!courseId || !sessionId)
    return NextResponse.json({ error: "กรุณาระบุ courseId และ sessionId" }, { status: 400 });

  // QR valid for 4 hours
  const token = await new SignJWT({ courseId, sessionId, institutionId: institutionId ?? null })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("4h")
    .sign(QR_SECRET);

  return NextResponse.json({ token });
}

// Scan QR — student checks in
export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth || auth.role !== "student")
    return NextResponse.json({ error: "กรุณาเข้าสู่ระบบด้วยบัญชีนักเรียน" }, { status: 401 });

  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ error: "ไม่พบ token" }, { status: 400 });

  try {
    const { payload } = await jwtVerify(token, QR_SECRET);
    const { courseId, sessionId, institutionId } = payload as { courseId: string; sessionId: string; institutionId: string | null };

    await connectDB();
    const record = await Attendance.findOneAndUpdate(
      { courseId, sessionId, studentId: auth.userId },
      { $set: { institutionId: institutionId ?? undefined, method: "qr", checkedInAt: new Date() } },
      { upsert: true, new: true }
    );
    return NextResponse.json({ ok: true, checkedInAt: record.checkedInAt });
  } catch {
    return NextResponse.json({ error: "QR Code หมดอายุหรือไม่ถูกต้อง" }, { status: 400 });
  }
}
