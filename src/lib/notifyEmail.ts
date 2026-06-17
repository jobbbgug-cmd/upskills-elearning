import { connectDB } from "@/lib/mongodb";
import SystemSetting from "@/models/SystemSetting";

export async function getNotifyEmail(): Promise<string> {
  await connectDB();
  const s = await SystemSetting.findOne({ key: "trialNotifyEmail" }).lean() as { value?: string } | null;
  return s?.value || process.env.NOTIFY_EMAIL || "jobbbgug@gmail.com";
}
