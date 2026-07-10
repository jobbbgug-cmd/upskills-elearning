import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Course from "@/models/Course";

export async function GET() {
  try {
    await connectDB();
    const categories = await Course.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const result = categories.map((cat) => ({
      name: cat._id || "อื่น ๆ",
      count: cat.count,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Categories fetch error:", error);
    return NextResponse.json([], { status: 500 });
  }
}
