import { connectDB } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Course from "@/models/Course";
import User from "@/models/User";

export async function GET(req: Request) {
  try {
    await connectDB();
    const user = await getAuthUser();

    if (!user || !["admin", "super_admin"].includes(user.role)) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");

    const filter: any = {};
    if (user.role === "admin") {
      filter.institutionId = user.institutionId;
    }
    if (status) filter.status = status;
    if (type) filter.type = type;

    const orders = await Order.find(filter)
      .populate("userId", "name email")
      .populate("courseId", "title price")
      .populate("productId", "name price stock")
      .sort({ createdAt: -1 })
      .limit(100);

    return Response.json({ orders });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const user = await getAuthUser();

    if (!user || !["admin", "super_admin"].includes(user.role)) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { userId, type, courseId, productId, quantity, amount, status } = body;

    if (!userId || !type || !amount) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const order = new Order({
      institutionId: user.role === "admin" ? user.institutionId : null,
      userId,
      type,
      courseId: type === "course" ? courseId : null,
      productId: type === "product" ? productId : null,
      quantity: type === "product" ? quantity : 1,
      amount,
      status: status || "pending",
    });

    await order.save();

    // If product order, update stock
    if (type === "product" && productId) {
      await Product.findByIdAndUpdate(productId, {
        $inc: { stock: -quantity },
      });
    }

    return Response.json(order, { status: 201 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to create order" }, { status: 500 });
  }
}
