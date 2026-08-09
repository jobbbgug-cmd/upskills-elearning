import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import Invoice from "@/models/Invoice";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || (auth.role !== "admin" && auth.role !== "owner")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const invoices = await Invoice.find({}).sort({ createdAt: -1 });

    return NextResponse.json({ invoices });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || (auth.role !== "admin" && auth.role !== "owner")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();

    const {
      orderId,
      courseId,
      courseName,
      sellerName,
      sellerAddress,
      sellerTaxId,
      sellerPhone,
      buyerName,
      buyerAddress,
      buyerTaxId,
      buyerPhone,
      buyerEmail,
      amount,
      taxRate = 0.07,
    } = body;

    const taxAmount = Math.round(amount * taxRate * 100) / 100;
    const totalAmount = amount + taxAmount;

    const invoice = await Invoice.create({
      orderId,
      courseId,
      courseName,
      sellerName,
      sellerAddress,
      sellerTaxId,
      sellerPhone,
      buyerName,
      buyerAddress,
      buyerTaxId,
      buyerPhone,
      buyerEmail,
      amount,
      taxAmount,
      totalAmount,
      status: "pending",
    });

    return NextResponse.json({ invoice }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
