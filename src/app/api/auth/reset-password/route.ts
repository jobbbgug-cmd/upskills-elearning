import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import PasswordResetToken from "@/models/PasswordResetToken";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();
    if (!token || !password) return NextResponse.json({ error: "ข้อมูลไม่ครบ" }, { status: 400 });
    if (password.length < 6) return NextResponse.json({ error: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" }, { status: 400 });

    await connectDB();

    const record = await PasswordResetToken.findOne({ token, used: false });
    if (!record) return NextResponse.json({ error: "ลิงก์ไม่ถูกต้องหรือหมดอายุแล้ว" }, { status: 400 });
    if (record.expiresAt < new Date()) return NextResponse.json({ error: "ลิงก์หมดอายุแล้ว กรุณาขอใหม่" }, { status: 400 });

    const hashed = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(record.userId, { password: hashed });
    await PasswordResetToken.findByIdAndUpdate(record._id, { used: true });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[reset-password]", err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด กรุณาลองใหม่" }, { status: 500 });
  }
}
