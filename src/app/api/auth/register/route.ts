import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const { name, email, role, gradeLevel, contactChannel, contactId } = await req.json();

    if (!name || !email) {
      return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบ" }, { status: 400 });
    }
    if (!contactChannel || !contactId) {
      return NextResponse.json({ error: "กรุณาระบุช่องทางการรับ Username/Password" }, { status: 400 });
    }

    const allowedRoles = ["student", "teacher"];
    const userRole = allowedRoles.includes(role) ? role : "student";

    await connectDB();

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: "อีเมลนี้ถูกใช้งานแล้ว" }, { status: 400 });
    }

    const resolvedGradeLevel = userRole === "teacher" ? "ทุกระดับชั้น" : (gradeLevel ?? "");
    await User.create({ name, email, role: userRole, gradeLevel: resolvedGradeLevel, status: "pending", password: "", contactChannel, contactId });

    return NextResponse.json({ message: "ส่งคำขอสมัครสมาชิกสำเร็จ รอการอนุมัติจาก Admin" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
