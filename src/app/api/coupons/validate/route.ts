import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { resolveInstitutionId } from "@/lib/tenant";
import Coupon from "@/models/Coupon";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const institutionId = await resolveInstitutionId(req, auth.institutionId);
    if (!institutionId) return NextResponse.json({ error: "ไม่พบสถาบัน" }, { status: 404 });
    const { code, courseId, originalPrice } = await req.json();
    if (!code) return NextResponse.json({ error: "กรุณาระบุโค้ด" }, { status: 400 });

    const coupon = await Coupon.findOne({ institutionId, code: code.toUpperCase().trim(), isActive: true });
    if (!coupon) return NextResponse.json({ error: "โค้ดส่วนลดไม่ถูกต้องหรือไม่มีในระบบ" }, { status: 404 });

    if (coupon.expiresAt && coupon.expiresAt < new Date())
      return NextResponse.json({ error: "โค้ดส่วนลดหมดอายุแล้ว" }, { status: 400 });

    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses)
      return NextResponse.json({ error: "โค้ดส่วนลดถูกใช้ครบแล้ว" }, { status: 400 });

    if (coupon.courseIds.length > 0 && courseId) {
      const applicable = coupon.courseIds.map((id) => id.toString()).includes(new mongoose.Types.ObjectId(courseId).toString());
      if (!applicable) return NextResponse.json({ error: "โค้ดนี้ใช้ไม่ได้กับคอร์สนี้" }, { status: 400 });
    }

    const price = Number(originalPrice) || 0;
    const discount = coupon.type === "percent"
      ? Math.round(price * coupon.value / 100)
      : Math.min(coupon.value, price);
    const finalPrice = Math.max(0, price - discount);

    return NextResponse.json({
      valid: true,
      couponId: coupon._id.toString(),
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discount,
      finalPrice,
    });
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
