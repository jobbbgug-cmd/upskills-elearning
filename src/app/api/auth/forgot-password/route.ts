import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import dns from "dns/promises";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import PasswordResetToken from "@/models/PasswordResetToken";
import nodemailer from "nodemailer";

const BASE_URL = "https://www.upskillsth.com";
const LOGO_URL = `${BASE_URL}/icon.png`;

async function sendResetEmail(to: string, name: string, resetUrl: string) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  await transporter.sendMail({
    from: `"UPSkills System" <${process.env.SMTP_USER}>`,
    to,
    subject: "[UPSkills] รีเซ็ตรหัสผ่านของคุณ",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#f9fafb;padding:24px;border-radius:12px;">
        <div style="background:#7c3aed;padding:20px 24px;border-radius:8px 8px 0 0;text-align:center;">
          <img src="${LOGO_URL}" alt="UPSkills" style="height:44px;display:block;margin:0 auto 10px;" />
          <h2 style="color:#fff;margin:0;font-size:20px;">รีเซ็ตรหัสผ่าน</h2>
        </div>
        <div style="background:#fff;padding:28px 24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
          <p style="color:#374151;font-size:15px;margin:0 0 8px;">สวัสดีคุณ <strong>${name}</strong></p>
          <p style="color:#6b7280;font-size:14px;margin:0 0 24px;">เราได้รับคำขอรีเซ็ตรหัสผ่านของคุณ กดปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่</p>
          <div style="text-align:center;margin-bottom:24px;">
            <a href="${resetUrl}"
              style="display:inline-block;background:#7c3aed;color:#fff;padding:13px 32px;border-radius:10px;text-decoration:none;font-weight:600;font-size:15px;">
              รีเซ็ตรหัสผ่าน →
            </a>
          </div>
          <p style="color:#9ca3af;font-size:12px;margin:0;text-align:center;">ลิงก์นี้จะหมดอายุภายใน 30 นาที<br/>หากคุณไม่ได้ขอรีเซ็ตรหัสผ่าน สามารถเพิกเฉยอีเมลนี้ได้</p>
        </div>
        <p style="text-align:center;font-size:12px;color:#9ca3af;margin-top:12px;">UPSkills E-Learning Platform</p>
      </div>
    `,
  });
}

export async function POST(req: NextRequest) {
  try {
    const { accountEmail, receiveEmail } = await req.json();
    if (!accountEmail) return NextResponse.json({ error: "กรุณากรอกอีเมลที่ใช้เข้าสู่ระบบ" }, { status: 400 });
    if (!receiveEmail) return NextResponse.json({ error: "กรุณากรอกอีเมลที่ต้องการรับลิงก์" }, { status: 400 });

    // Validate receive email domain via MX record lookup
    const receiveDomain = receiveEmail.toLowerCase().trim().split("@")[1];
    if (!receiveDomain) {
      return NextResponse.json({ error: "อีเมลนี้ไม่สามารถรับลิงก์รีเซ็ตรหัสผ่านได้", field: "receive" }, { status: 400 });
    }
    try {
      const mx = await dns.resolveMx(receiveDomain);
      if (!mx || mx.length === 0) throw new Error("no MX");
    } catch {
      return NextResponse.json({ error: "อีเมลนี้ไม่สามารถรับลิงก์รีเซ็ตรหัสผ่านได้", field: "receive" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ email: accountEmail.toLowerCase().trim() });

    if (!user) {
      return NextResponse.json({ error: "ไม่พบอีเมลนี้ในระบบ", field: "account" }, { status: 404 });
    }

    // Invalidate old tokens
    await PasswordResetToken.deleteMany({ userId: user._id });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    await PasswordResetToken.create({ userId: user._id, token, expiresAt });

    const resetUrl = `${BASE_URL}/reset-password?token=${token}`;
    await sendResetEmail(receiveEmail.toLowerCase().trim(), user.name, resetUrl);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[forgot-password]", err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด กรุณาลองใหม่" }, { status: 500 });
  }
}
