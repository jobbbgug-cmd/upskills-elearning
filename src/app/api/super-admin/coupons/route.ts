import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Coupon from "@/models/Coupon";
import Promotion from "@/models/Promotion";
import Package from "@/models/Package";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "super_admin")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();

    const institutionId = req.nextUrl.searchParams.get("institutionId");
    const type = req.nextUrl.searchParams.get("type") || "coupon";

    const filter: Record<string, unknown> = {};
    if (institutionId) filter.institutionId = institutionId;

    let items: any[] = [];

    if (type === "coupon" || type === "all") {
      const coupons = await Coupon.find(filter)
        .populate("institutionId", "name slug")
        .populate("courseIds", "title")
        .sort({ createdAt: -1 })
        .lean();
      items = items.concat(
        coupons.map((c: any) => ({
          ...c,
          itemType: "coupon",
        }))
      );
    }

    if (type === "promotion" || type === "all") {
      const promotions = await Promotion.find(filter)
        .populate("institutionId", "name slug")
        .populate("courseIds", "title")
        .sort({ createdAt: -1 })
        .lean();
      items = items.concat(
        promotions.map((p: any) => ({
          ...p,
          itemType: "promotion",
        }))
      );
    }

    if (type === "package" || type === "all") {
      const packages = await Package.find(filter)
        .populate("institutionId", "name slug")
        .populate("courseIds", "title")
        .sort({ createdAt: -1 })
        .lean();
      items = items.concat(
        packages.map((pkg: any) => ({
          ...pkg,
          itemType: "package",
        }))
      );
    }

    // Sort by createdAt descending
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(JSON.parse(JSON.stringify(items)));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "super_admin")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const body = await req.json();
    const { itemType, ...data } = body;

    let item: any;

    if (itemType === "coupon") {
      item = new Coupon(data);
    } else if (itemType === "promotion") {
      item = new Promotion(data);
    } else if (itemType === "package") {
      item = new Package(data);
    } else {
      return NextResponse.json({ error: "Invalid item type" }, { status: 400 });
    }

    await item.save();
    return NextResponse.json({ ...item.toObject(), itemType }, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
