import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { currentPassword, newPassword } = await req.json();
  if (!currentPassword || !newPassword)
    return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบ" }, { status: 400 });
  if (newPassword.length < 6)
    return NextResponse.json({ error: "รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร" }, { status: 400 });

  await connectDB();
  const user = await User.findById(auth.userId);
  if (!user) return NextResponse.json({ error: "ไม่พบผู้ใช้งาน" }, { status: 404 });

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) return NextResponse.json({ error: "รหัสผ่านปัจจุบันไม่ถูกต้อง" }, { status: 400 });

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  return NextResponse.json({ ok: true });
}
