import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Course from "@/models/Course";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || !["admin", "owner"].includes(auth.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const search = req.nextUrl.searchParams.get("search");

    const filter: Record<string, any> = { institutionId: auth.institutionId };

    let query = Course.find(filter);

    if (search) {
      const searchRegex = new RegExp(search, "i");
      query = query.or([
        { title: searchRegex },
        { description: searchRegex },
      ]);
    }

    const courses = await query.sort({ createdAt: -1 }).lean();

    return NextResponse.json(courses);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || !["admin", "owner"].includes(auth.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();

    const { title, description, price, image, isActive } = body;

    if (!title || price === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const course = new Course({
      institutionId: auth.institutionId,
      title,
      description: description || "",
      price,
      image: image || "",
      isActive: isActive !== false,
    });

    await course.save();

    return NextResponse.json(course, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Failed to create course" },
      { status: 500 }
    );
  }
}
