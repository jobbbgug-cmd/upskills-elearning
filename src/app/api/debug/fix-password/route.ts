import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      );
    }

    await connectDB();
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.updateOne({ _id: user._id }, { password: hashedPassword });

    return NextResponse.json({
      success: true,
      message: "Password updated and hashed",
      email,
    });
  } catch (error) {
    console.error("Error fixing password:", error);
    return NextResponse.json(
      { error: "Failed to fix password" },
      { status: 500 }
    );
  }
}
