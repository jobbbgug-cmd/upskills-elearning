import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { withTimeout } from "@/lib/query-timeout";
import Invoice from "@/models/Invoice";

async function getInvoices() {
  await connectDB();
  const user = await getAuthUser();

  if (!user) {
    return [];
  }

  try {
    const invoices = await Invoice.find({ email: user.email })
      .sort({ invoiceDate: -1 })
      .lean();

    return invoices.map((inv: any) => ({
      _id: inv._id.toString(),
      invoiceNumber: inv.invoiceNumber || `INV-${inv._id}`,
      fullName: inv.name || user.name,
      email: inv.email,
      taxId: inv.taxId,
      address: inv.address,
      houseNumber: inv.houseNumber,
      subDistrict: inv.subDistrict,
      amphoe: inv.amphoe,
      province: inv.province,
      postalCode: inv.postalCode,
      courseName: inv.courseName || "คอร์ส",
      coursePrice: inv.coursePrice || 0,
      purchaseDate: inv.purchaseDate || new Date(),
      invoiceDate: inv.invoiceDate || new Date(),
      status: inv.status || "pending",
    }));
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return [];
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "online") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const invoices = await withTimeout(getInvoices(), 10000, []);
    return NextResponse.json(invoices);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}
