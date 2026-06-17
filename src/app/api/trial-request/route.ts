import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import TrialRequest from "@/models/TrialRequest";
import SystemSetting from "@/models/SystemSetting";
import { sendTrialRequestNotification } from "@/lib/email";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { institutionName, fullName, phone, institutionType, contactChannel, contactValue } = body;

  if (!institutionName || !fullName || !phone || !institutionType || !contactChannel || !contactValue) {
    return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" }, { status: 400 });
  }

  await connectDB();
  await TrialRequest.create({ institutionName, fullName, phone, institutionType, contactChannel, contactValue });

  try {
    const setting = await SystemSetting.findOne({ key: "trialNotifyEmail" }).lean() as { value?: string } | null;
    const to = setting?.value || undefined;
    await sendTrialRequestNotification({ institutionName, fullName, phone, institutionType, contactChannel, contactValue, to });
  } catch (err) {
    console.error("[trial-request] email send failed:", err);
  }

  return NextResponse.json({ ok: true });
}
