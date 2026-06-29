import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { resolveInstitutionId, tenantFilter } from "@/lib/tenant";
import User from "@/models/User";
import mongoose from "mongoose";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const institutionId = await resolveInstitutionId(req, auth.institutionId);

    if (!body.name || !body.url || !body.type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newDoc = {
      _id: new mongoose.Types.ObjectId(),
      name: body.name,
      url: body.url,
      type: body.type,
      uploadedAt: new Date(),
    };

    const user = await User.findOneAndUpdate(
      { _id: id, ...tenantFilter(institutionId) },
      { $push: { documents: newDoc } },
      { new: true }
    ).select("-password");

    if (!user) return NextResponse.json({ error: "ไม่พบผู้ใช้" }, { status: 404 });

    return NextResponse.json(newDoc);
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
