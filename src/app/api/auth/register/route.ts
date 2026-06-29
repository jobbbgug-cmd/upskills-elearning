import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { sendNewMemberNotification } from "@/lib/email";
import { getNotifyEmail } from "@/lib/notifyEmail";
import User from "@/models/User";
import Institution from "@/models/Institution";

export async function POST(req: NextRequest) {
  try {
    const { name, email, role, gradeLevel, teacherId, teacherName, contactChannel, contactId, institutionId } = await req.json();

    if (!name || !email) {
      return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบ" }, { status: 400 });
    }
    if (!contactChannel || !contactId) {
      return NextResponse.json({ error: "กรุณาระบุช่องทางการรับ Username/Password" }, { status: 400 });
    }

    const allowedRoles = ["student", "teacher", "parent"];
    const userRole = allowedRoles.includes(role) ? role : "student";

    await connectDB();

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: "อีเมลนี้ถูกใช้งานแล้ว" }, { status: 400 });
    }

    const resolvedGradeLevel = userRole === "teacher" ? "ทุกระดับชั้น" : (gradeLevel ?? "");

    await User.create({
      institutionId: institutionId ?? undefined,
      name,
      email,
      role: userRole,
      gradeLevel: resolvedGradeLevel,
      teacherId: (userRole === "student" || userRole === "parent") ? (teacherId ?? "") : "",
      teacherName: (userRole === "student" || userRole === "parent") ? (teacherName ?? "") : "",
      status: "pending",
      password: "",
      contactChannel,
      contactId,
    });

    // ส่ง email แจ้งเตือน super admin — ไม่ block ถ้า email ส่งไม่ได้
    try {
      let institutionName: string | undefined;
      if (institutionId) {
        const inst = await Institution.findById(institutionId).select("name").lean() as { name: string } | null;
        institutionName = inst?.name;
      }
      const to = await getNotifyEmail();
      await sendNewMemberNotification({ name, email, role: userRole, institutionName, to });
    } catch (emailErr) {
      console.error("Email notification failed:", emailErr);
    }

    return NextResponse.json({ message: "ส่งคำขอสมัครสมาชิกสำเร็จ รอการอนุมัติจาก Admin" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
