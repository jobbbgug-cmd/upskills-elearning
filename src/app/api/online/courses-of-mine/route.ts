import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { withTimeout } from "@/lib/query-timeout";

async function getCourses() {
  await connectDB();
  const user = await getAuthUser();

  if (!user) {
    return [];
  }

  // For online users, fetch their purchased courses
  // This would depend on your booking/order model
  // For now, return empty array as placeholder
  return [];
}

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "online") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const courses = await withTimeout(getCourses(), 10000, []);
    return NextResponse.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}
