import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendPaymentSlipNotification(info: {
  studentName: string;
  studentEmail: string;
  courseTitle: string;
  institutionName?: string;
  bookingId: string;
}) {
  await transporter.sendMail({
    from: `"UPSkill System" <${process.env.SMTP_USER}>`,
    to: process.env.NOTIFY_EMAIL ?? "jobbbgug@gmail.com",
    subject: `[UPSkill] มีสลิปชำระเงินรอตรวจสอบ — ${info.courseTitle}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#f9fafb;padding:24px;border-radius:12px;">
        <div style="background:#7c3aed;padding:20px 24px;border-radius:8px 8px 0 0;text-align:center;">
          <h2 style="color:#fff;margin:0;font-size:20px;">มีสลิปชำระเงินรอตรวจสอบ</h2>
        </div>
        <div style="background:#fff;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr>
              <td style="padding:8px 0;color:#6b7280;width:120px;">นักเรียน</td>
              <td style="padding:8px 0;font-weight:600;color:#111827;">${info.studentName}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#6b7280;">อีเมล</td>
              <td style="padding:8px 0;color:#111827;">${info.studentEmail}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#6b7280;">คอร์ส</td>
              <td style="padding:8px 0;font-weight:600;color:#7c3aed;">${info.courseTitle}</td>
            </tr>
            ${info.institutionName ? `
            <tr>
              <td style="padding:8px 0;color:#6b7280;">สถาบัน</td>
              <td style="padding:8px 0;color:#111827;">${info.institutionName}</td>
            </tr>` : ""}
          </table>
          <div style="margin-top:20px;text-align:center;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL ?? "https://upskills-elearning.vercel.app"}/super-admin/bookings"
              style="display:inline-block;background:#7c3aed;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
              ไปตรวจสอบการชำระ →
            </a>
          </div>
        </div>
        <p style="text-align:center;font-size:12px;color:#9ca3af;margin-top:12px;">UPSkill E-Learning Platform</p>
      </div>
    `,
  });
}

export async function sendNewMemberNotification(member: {
  name: string;
  email: string;
  role: string;
  institutionName?: string;
}) {
  const roleLabel: Record<string, string> = {
    student: "นักเรียน",
    teacher: "ครู/อาจารย์",
    admin: "Admin",
  };

  await transporter.sendMail({
    from: `"UPSkill System" <${process.env.SMTP_USER}>`,
    to: process.env.NOTIFY_EMAIL ?? "jobbbgug@gmail.com",
    subject: `[UPSkill] มีสมาชิกใหม่รออนุมัติ — ${member.name}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#f9fafb;padding:24px;border-radius:12px;">
        <div style="background:#4f46e5;padding:20px 24px;border-radius:8px 8px 0 0;text-align:center;">
          <h2 style="color:#fff;margin:0;font-size:20px;">มีสมาชิกใหม่รออนุมัติ</h2>
        </div>
        <div style="background:#fff;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr>
              <td style="padding:8px 0;color:#6b7280;width:120px;">ชื่อ</td>
              <td style="padding:8px 0;font-weight:600;color:#111827;">${member.name}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#6b7280;">อีเมล</td>
              <td style="padding:8px 0;color:#111827;">${member.email}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#6b7280;">ประเภท</td>
              <td style="padding:8px 0;color:#111827;">${roleLabel[member.role] ?? member.role}</td>
            </tr>
            ${member.institutionName ? `
            <tr>
              <td style="padding:8px 0;color:#6b7280;">สถาบัน</td>
              <td style="padding:8px 0;color:#111827;">${member.institutionName}</td>
            </tr>` : ""}
          </table>
          <div style="margin-top:20px;text-align:center;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL ?? "https://upskills-elearning.vercel.app"}/super-admin/members"
              style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
              ไปอนุมัติสมาชิก →
            </a>
          </div>
        </div>
        <p style="text-align:center;font-size:12px;color:#9ca3af;margin-top:12px;">UPSkill E-Learning Platform</p>
      </div>
    `,
  });
}

export async function sendTrialRequestNotification(info: {
  institutionName: string;
  fullName: string;
  phone: string;
  institutionType: string;
  contactChannel: string;
  contactValue: string;
}) {
  await transporter.sendMail({
    from: `"UPSkill System" <${process.env.SMTP_USER}>`,
    to: process.env.NOTIFY_EMAIL ?? "jobbbgug@gmail.com",
    subject: `[UPSkill] คำขอทดลองใช้งานใหม่ — ${info.institutionName}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#f0fdfa;padding:24px;border-radius:12px;">
        <div style="background:#0d9488;padding:20px 24px;border-radius:8px 8px 0 0;text-align:center;">
          <h2 style="color:#fff;margin:0;font-size:20px;">คำขอทดลองใช้งานใหม่</h2>
        </div>
        <div style="background:#fff;padding:24px;border:1px solid #ccfbf1;border-top:none;border-radius:0 0 8px 8px;">
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr>
              <td style="padding:8px 0;color:#6b7280;width:140px;">ชื่อสถาบัน</td>
              <td style="padding:8px 0;font-weight:600;color:#111827;">${info.institutionName}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#6b7280;">ชื่อ-นามสกุล</td>
              <td style="padding:8px 0;color:#111827;">${info.fullName}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#6b7280;">เบอร์ติดต่อ</td>
              <td style="padding:8px 0;color:#111827;">${info.phone}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#6b7280;">ประเภทสถาบัน</td>
              <td style="padding:8px 0;color:#111827;">${info.institutionType}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#6b7280;">ช่องทางรับข้อมูล</td>
              <td style="padding:8px 0;color:#111827;">${info.contactChannel}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#6b7280;">ที่อยู่ติดต่อ</td>
              <td style="padding:8px 0;color:#111827;">${info.contactValue}</td>
            </tr>
          </table>
          <div style="margin-top:20px;text-align:center;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL ?? "https://upskills-elearning.vercel.app"}/super-admin/trials"
              style="display:inline-block;background:#0d9488;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
              ดูรายการคำขอ →
            </a>
          </div>
        </div>
        <p style="text-align:center;font-size:12px;color:#9ca3af;margin-top:12px;">UPSkill E-Learning Platform</p>
      </div>
    `,
  });
}
