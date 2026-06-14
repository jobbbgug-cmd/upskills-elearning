import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Payout from "@/models/Payout";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthUser();
  if (!auth || auth.role !== "super_admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const { id } = await params;
  const { status, note } = await req.json();

  const payout = await Payout.findById(id);
  if (!payout) return NextResponse.json({ error: "ไม่พบรายการ" }, { status: 404 });

  if (status) payout.status = status;
  if (status === "paid") payout.paidAt = new Date();
  if (note !== undefined) payout.note = note;
  await payout.save();

  return NextResponse.json(JSON.parse(JSON.stringify(payout)));
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthUser();
  if (!auth || auth.role !== "super_admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const { id } = await params;
  await Payout.findByIdAndDelete(id);
  return NextResponse.json({ message: "ลบสำเร็จ" });
}
