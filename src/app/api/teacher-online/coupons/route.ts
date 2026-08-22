import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";
import Coupon from "@/models/Coupon";
import Promotion from "@/models/Promotion";
import Package from "@/models/Package";

// Fixed ObjectId for teacher-online (represents teacher-online institution)
const TEACHER_ONLINE_ID = new mongoose.Types.ObjectId("000000000000000000000001");

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || (auth.role !== "teacher-online" && auth.role !== "teacher_online"))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const type = req.nextUrl.searchParams.get("type") || "coupon";

    const filter = { institutionId: TEACHER_ONLINE_ID };
    let items: any[] = [];

    if (type === "coupon" || type === "all") {
      const coupons = await Coupon.find(filter)
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
    if (!auth || (auth.role !== "teacher-online" && auth.role !== "teacher_online"))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();

    const body = await req.json();
    const { itemType, ...data } = body;

    // Set default institutionId for teacher-online (not used but required by schema)
    data.institutionId = TEACHER_ONLINE_ID;

    let item: any;

    if (itemType === "coupon") {
      if (!data.code || !data.type || !data.value)
        return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบ" }, { status: 400 });
      data.code = data.code.toUpperCase().trim();
      item = await Coupon.create(data);
    } else if (itemType === "promotion") {
      if (!data.title || !data.type || !data.value || !data.startDate)
        return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบ" }, { status: 400 });
      item = await Promotion.create(data);
    } else if (itemType === "package") {
      if (!data.name || !data.price)
        return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบ" }, { status: 400 });
      item = await Package.create(data);
    } else {
      return NextResponse.json({ error: "Invalid item type" }, { status: 400 });
    }

    return NextResponse.json({ ...item.toObject(), itemType }, { status: 201 });
  } catch (err: unknown) {
    console.error(err);
    if ((err as { code?: number }).code === 11000)
      return NextResponse.json({ error: "โค้ดนี้ถูกใช้แล้ว" }, { status: 409 });
    return NextResponse.json({ error: (err as any).message || "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
