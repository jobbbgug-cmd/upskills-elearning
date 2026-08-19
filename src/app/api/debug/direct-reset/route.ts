import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const { email, newPassword } = await req.json();

    if (!email || !newPassword) {
      return NextResponse.json(
        { error: "Email and newPassword required" },
        { status: 400 }
      );
    }

    console.log("=== PASSWORD RESET ===");
    console.log("Email:", email);
    console.log("New Password:", newPassword);

    await connectDB();
    console.log("DB connected");

    const user = await User.findOne({ email: email.toLowerCase() });
    console.log("User found:", user ? "YES" : "NO");

    if (!user) {
      console.log("User not found in database");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("Hashing password...");
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log("Hash created, length:", hashedPassword.length);

    console.log("Updating user...");
    const result = await User.findByIdAndUpdate(
      user._id,
      { password: hashedPassword },
      { new: true }
    );

    console.log("Update successful:", result ? "YES" : "NO");
    console.log("===================");

    return NextResponse.json({
      success: true,
      email,
      newPassword,
      message: `Password reset to: ${newPassword}. Use this to login.`,
    });
  } catch (error) {
    console.error("=== ERROR ===");
    console.error(error);
    console.error("=============");
    return NextResponse.json(
      { error: "Failed: " + String(error) },
      { status: 500 }
    );
  }
}
