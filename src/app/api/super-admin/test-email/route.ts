import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { sendNewMemberNotification } from "@/lib/email";

export async function POST() {
  const auth = await getAuthUser();
  if (!auth || auth.role !== "super_admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const smtpUser = process.env.SMTP_USER ?? "(ไม่พบ)";
  const smtpPass = process.env.SMTP_PASS ? `${process.env.SMTP_PASS.slice(0, 4)}****` : "(ไม่พบ)";
  const notifyEmail = process.env.NOTIFY_EMAIL ?? "(ไม่พบ)";

  try {
    await sendNewMemberNotification({
      name: "ทดสอบระบบ",
      email: "test@example.com",
      role: "student",
      institutionName: "UPSkill Test",
    });
    return NextResponse.json({ ok: true, smtpUser, smtpPass, notifyEmail });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err), smtpUser, smtpPass, notifyEmail }, { status: 500 });
  }
}
