import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import Course from "@/models/Course";

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Update all courses without difficulty field to have default "medium"
    const result = await Course.updateMany(
      { difficulty: { $exists: false } },
      { $set: { difficulty: "medium" } }
    );

    return NextResponse.json({
      message: `Updated ${result.modifiedCount} courses`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error updating difficulties:", error);
    return NextResponse.json(
      { error: "Failed to update difficulties" },
      { status: 500 }
    );
  }
}
