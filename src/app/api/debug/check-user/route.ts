import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ found: false, message: "User not found" });
    }

    return NextResponse.json({
      found: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      status: user.status,
      password_length: user.password?.length || 0,
      password_starts_with: user.password?.substring(0, 10) || "N/A",
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error("Error checking user:", error);
    return NextResponse.json(
      { error: "Failed to check user" },
      { status: 500 }
    );
  }
}
