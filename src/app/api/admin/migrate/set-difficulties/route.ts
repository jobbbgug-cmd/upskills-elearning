import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import Course from "@/models/Course";
import LearningPath from "@/models/LearningPath";

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Update courses without difficulty
    const courseResult = await Course.updateMany(
      { $or: [{ difficulty: { $exists: false } }, { difficulty: null }] },
      { $set: { difficulty: "medium" } }
    );

    // Update learning paths without difficulty
    const pathResult = await LearningPath.updateMany(
      { $or: [{ difficulty: { $exists: false } }, { difficulty: null }] },
      { $set: { difficulty: "medium" } }
    );

    // Get counts by difficulty
    const courseCounts = await Course.aggregate([
      { $group: { _id: "$difficulty", count: { $sum: 1 } } },
    ]);

    const pathCounts = await LearningPath.aggregate([
      { $group: { _id: "$difficulty", count: { $sum: 1 } } },
    ]);

    return NextResponse.json({
      message: "Migration completed",
      coursesUpdated: courseResult.modifiedCount,
      pathsUpdated: pathResult.modifiedCount,
      courseDifficultyCounts: courseCounts,
      pathDifficultyCounts: pathCounts,
    });
  } catch (error) {
    console.error("Error migrating difficulties:", error);
    return NextResponse.json(
      { error: "Failed to migrate difficulties" },
      { status: 500 }
    );
  }
}
