import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { resolveInstitutionId, tenantFilter } from "@/lib/tenant";
import Coupon from "@/models/Coupon";
import Promotion from "@/models/Promotion";
import Package from "@/models/Package";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || (auth.role !== "admin" && auth.role !== "super_admin"))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const institutionId = await resolveInstitutionId(req, auth.institutionId);
    const type = req.nextUrl.searchParams.get("type") || "coupon";

    let items: any[] = [];

    if (type === "coupon" || type === "all") {
      const coupons = await Coupon.find(tenantFilter(institutionId))
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
      const promotions = await Promotion.find(tenantFilter(institutionId))
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
      const packages = await Package.find(tenantFilter(institutionId))
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
    if (!auth || (auth.role !== "admin" && auth.role !== "super_admin"))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const institutionId = await resolveInstitutionId(req, auth.institutionId);
    if (!institutionId) return NextResponse.json({ error: "ไม่พบสถาบัน" }, { status: 404 });

    const body = await req.json();
    const { itemType, ...data } = body;

    data.institutionId = institutionId;

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
