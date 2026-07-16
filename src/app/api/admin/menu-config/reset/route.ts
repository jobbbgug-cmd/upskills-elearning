import { NextRequest, NextResponse } from "next/server";
import MenuConfig from "@/models/MenuConfig";
import dbConnect from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    // Delete menu-config for super_admin
    const result = await MenuConfig.deleteOne({ role: "super_admin" });

    return NextResponse.json({
      success: true,
      message: "Menu config reset",
      deleted: result.deletedCount
    });
  } catch (error) {
    console.error("Error resetting menu config:", error);
    return NextResponse.json(
      { error: "Failed to reset menu config" },
      { status: 500 }
    );
  }
}
