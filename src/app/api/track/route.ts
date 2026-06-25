import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ActivityLog from "@/models/ActivityLog";

export async function POST(req: NextRequest) {
  try {
    const { action, description, metadata } = await req.json();
    if (!action) return NextResponse.json({ ok: true });

    await connectDB();
    await ActivityLog.create({
      userId:    "guest",
      userName:  "ผู้เยี่ยมชม",
      userEmail: "-",
      userRole:  "guest",
      action,
      description,
      metadata:  metadata ?? null,
      ipAddress: req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? null,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
