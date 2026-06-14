import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { connectDB } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { tenantFilter, resolveInstitutionId } from "@/lib/tenant";
import Booking from "@/models/Booking";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });

    const { id } = await params;
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "ไม่พบไฟล์" }, { status: 400 });

    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type))
      return NextResponse.json({ error: "รองรับเฉพาะ JPG, PNG, WebP" }, { status: 400 });

    await connectDB();
    const institutionId = await resolveInstitutionId(req, auth.institutionId);
    const booking = await Booking.findOne({ _id: id, ...tenantFilter(institutionId) });
    if (!booking) return NextResponse.json({ error: "ไม่พบการจอง" }, { status: 404 });
    if (booking.userId.toString() !== auth.userId)
      return NextResponse.json({ error: "ไม่มีสิทธิ์" }, { status: 403 });

    const ext = file.name.split(".").pop() ?? "jpg";
    const filename = `slips/slip-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const blob = await put(filename, file, { access: "public" });

    booking.slipImage = blob.url;
    booking.expiresAt = null;
    await booking.save();

    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
