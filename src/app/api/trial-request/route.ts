import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import TrialRequest from "@/models/TrialRequest";
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
    await sendTrialRequestNotification({ institutionName, fullName, phone, institutionType, contactChannel, contactValue });
  } catch {
    // email failure is non-critical
  }

  return NextResponse.json({ ok: true });
}
