import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Course from "@/models/Course";
import Institution from "@/models/Institution";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || (auth.role !== "admin" && auth.role !== "teacher" && auth.role !== "teacher-online" && auth.role !== "teacher_online")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const tenantClause = auth.institutionId ? { institutionId: auth.institutionId } : {};
    const filter = (auth.role === "teacher" || auth.role === "teacher-online" || auth.role === "teacher_online") ? { ...tenantClause, instructorId: auth.userId } : tenantClause;

    const courses = await Course.find(filter).sort({ createdAt: -1 }).lean();

    let institutionName = "";
    if (auth.institutionId) {
      const inst = await Institution.findById(auth.institutionId).select("name").lean() as { name: string } | null;
      institutionName = inst?.name ?? "";
    }

    return NextResponse.json({
      courses: JSON.parse(JSON.stringify(courses)),
      institutionName,
    });
  } catch (error) {
    console.error("Failed to fetch courses:", error);
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || (auth.role !== "admin" && auth.role !== "teacher" && auth.role !== "teacher-online" && auth.role !== "teacher_online")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();

    const {
      title,
      description,
      price,
      coverImage,
      category,
      type,
      gradeLevels,
      sessions,
      instructor,
      isActive,
      contentId,
      difficulty,
      duration,
      linkDigital,
      linkClip,
      linkSupplementary,
      linkFullbook,
      linkDownload,
      ebookPdfUrl,
      whatYouWillLearn,
      courseDetails,
      lessons,
    } = body;

    if (!title || !description || !gradeLevels) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (type === "live online" && !sessions) {
      return NextResponse.json({ error: "Sessions are required for live online courses" }, { status: 400 });
    }

    const course = new Course({
      title,
      description,
      price: price || 0,
      coverImage: coverImage || "",
      category: category || null,
      type: type || "online",
      gradeLevels: gradeLevels || [],
      sessions: sessions || [],
      instructor: instructor || auth.name || "",
      instructorId: auth.userId,
      institutionId: auth.institutionId || null,
      isActive: isActive !== false,
      contentId: contentId || null,
      difficulty: difficulty || "medium",
      duration: duration || 0,
      linkDigital: linkDigital || "",
      linkClip: linkClip || "",
      linkSupplementary: linkSupplementary || "",
      linkFullbook: linkFullbook || "",
      linkDownload: linkDownload || "",
      ebookPdfUrl: ebookPdfUrl || "",
      whatYouWillLearn: whatYouWillLearn || "",
      courseDetails: courseDetails || "",
      lessons: lessons || [],
    });

    await course.save();

    return NextResponse.json(
      JSON.parse(JSON.stringify(course)),
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Failed to create course:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create course" },
      { status: 500 }
    );
  }
}
