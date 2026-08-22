import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import SystemSetting from "@/models/SystemSetting";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const settings = await SystemSetting.find({
      key: { $in: ["qrCodeUrl", "bankAccountName", "bankName", "bankAccountNumber"] }
    }).lean();

    const result: Record<string, string> = {};
    (settings as unknown as { key: string; value: string }[]).forEach((s) => {
      result[s.key] = s.value;
    });

    return NextResponse.json({
      qrCodeUrl: result.qrCodeUrl || "",
      bankAccountName: result.bankAccountName || "",
      bankName: result.bankName || "",
      bankAccountNumber: result.bankAccountNumber || "",
    });
  } catch (error) {
    console.error("Failed to fetch payment info:", error);
    return NextResponse.json({
      qrCodeUrl: "",
      bankAccountName: "",
      bankName: "",
      bankAccountNumber: "",
    });
  }
}
