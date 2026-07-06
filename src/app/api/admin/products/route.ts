import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const search = req.nextUrl.searchParams.get("search");

    const filter: Record<string, any> = { institutionId: auth.institutionId };

    let query = Product.find(filter);

    if (search) {
      const searchRegex = new RegExp(search, "i");
      query = query.or([
        { name: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
        { sku: searchRegex },
      ]);
    }

    const products = await query.sort({ createdAt: -1 }).lean();

    return NextResponse.json(products);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();

    const { name, description, price, stock, category, sku, image, isActive } = body;

    if (!name || price === undefined || stock === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const product = new Product({
      institutionId: auth.institutionId,
      name,
      description: description || "",
      price,
      stock,
      category: category || "",
      sku: sku || "",
      image: image || "",
      isActive: isActive !== false,
    });

    await product.save();

    return NextResponse.json(product, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Failed to create product" },
      { status: 500 }
    );
  }
}
