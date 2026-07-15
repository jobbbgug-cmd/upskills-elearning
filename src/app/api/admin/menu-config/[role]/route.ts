import { NextRequest, NextResponse } from "next/server";
import MenuConfig from "@/models/MenuConfig";
import dbConnect from "@/lib/mongodb";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ role: string }> }
) {
  try {
    await dbConnect();
    const { role } = await params;

    const menuConfig = await MenuConfig.findOne({ role });

    if (!menuConfig) {
      return NextResponse.json({ items: [] });
    }

    return NextResponse.json({ items: menuConfig.items || [] });
  } catch (error) {
    console.error("Error fetching menu config:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu config" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ role: string }> }
) {
  try {
    await dbConnect();
    const { role } = await params;
    const { items } = await req.json();

    const menuConfig = await MenuConfig.findOneAndUpdate(
      { role },
      { items, role },
      { upsert: true, new: true }
    );

    return NextResponse.json({ items: menuConfig.items || [] });
  } catch (error) {
    console.error("Error saving menu config:", error);
    return NextResponse.json(
      { error: "Failed to save menu config" },
      { status: 500 }
    );
  }
}
