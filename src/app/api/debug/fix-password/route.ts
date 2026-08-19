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
    console.log("Searching for user with email:", email);
    const user = await User.findOne({ email: email.toLowerCase() });
    console.log("User found:", user ? user.email : "not found");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Password hashed, updating user...");

    const updated = await User.updateOne({ _id: user._id }, { password: hashedPassword });
    console.log("Update result:", updated);

    return NextResponse.json({
      success: true,
      message: "Password updated and hashed",
      email,
      updated: updated.modifiedCount,
    });
  } catch (error) {
    console.error("Error fixing password:", error);
    console.error("Error details:", (error as any).message);
    return NextResponse.json(
      { error: "Failed to fix password" },
      { status: 500 }
    );
  }
}
