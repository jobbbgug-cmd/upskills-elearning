import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    await connectDB();
    const teachers = await User.find({ role: "teacher", status: "approved" })
      .select("_id name")
      .sort({ name: 1 })
      .lean();
    return NextResponse.json(JSON.parse(JSON.stringify(teachers)));
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}
