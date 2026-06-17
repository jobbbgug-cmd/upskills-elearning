import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import SystemSetting from "@/models/SystemSetting";

export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth || auth.role !== "super_admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");
  await connectDB();

  if (key) {
    const s = await SystemSetting.findOne({ key }).lean() as { value?: string } | null;
    return NextResponse.json({ value: s?.value ?? "" });
  }

  const all = await SystemSetting.find().lean();
  const result: Record<string, string> = {};
  (all as unknown as { key: string; value: string }[]).forEach((s) => { result[s.key] = s.value; });
  return NextResponse.json(result);
}

export async function PUT(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth || auth.role !== "super_admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { key, value } = await req.json();
  if (!key) return NextResponse.json({ error: "key required" }, { status: 400 });

  await connectDB();
  await SystemSetting.findOneAndUpdate({ key }, { value }, { upsert: true });
  return NextResponse.json({ ok: true });
}
