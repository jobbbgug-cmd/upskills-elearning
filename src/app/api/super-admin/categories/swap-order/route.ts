import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";
import { getAuthUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();
    const body = await req.json();
    const { id, newOrder, type, name, description } = body;

    if (newOrder === undefined || !type) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    // Get the current category
    const currentCategory = await Category.findById(id);
    if (!currentCategory) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const oldOrder = currentCategory.order;
    const updateData: any = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;

    // If order hasn't changed, just update name/description
    if (oldOrder === newOrder) {
      const updated = await Category.findByIdAndUpdate(id, updateData, { new: true }).lean();
      return NextResponse.json(updated);
    }

    // Find category with the new order value
    const targetCategory = await Category.findOne({ order: newOrder, type });

    if (targetCategory) {
      // Swap orders
      updateData.order = newOrder;
      await Category.findByIdAndUpdate(currentCategory._id, updateData);
      await Category.findByIdAndUpdate(targetCategory._id, { order: oldOrder });
    } else {
      // No target found, just update
      updateData.order = newOrder;
      await Category.findByIdAndUpdate(currentCategory._id, updateData);
    }

    // Return updated category
    const updated = await Category.findById(id).lean();
    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
