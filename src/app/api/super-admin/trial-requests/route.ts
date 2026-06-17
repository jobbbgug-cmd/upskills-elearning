import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import TrialRequest from "@/models/TrialRequest";

export async function GET() {
  const auth = await getAuthUser();
  if (!auth || auth.role !== "super_admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const items = await TrialRequest.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json({ items });
}

export async function PATCH(req: Request) {
  const auth = await getAuthUser();
  if (!auth || auth.role !== "super_admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, status } = await req.json();
  await connectDB();
  await TrialRequest.findByIdAndUpdate(id, { status });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const auth = await getAuthUser();
  if (!auth || auth.role !== "super_admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  await connectDB();
  await TrialRequest.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
