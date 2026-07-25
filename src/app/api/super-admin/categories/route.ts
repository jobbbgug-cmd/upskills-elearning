import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt?: Date;
}

export async function GET() {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // For now, return empty array as categories collection doesn't exist yet
    // This allows the page to load without errors
    return NextResponse.json([]);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
