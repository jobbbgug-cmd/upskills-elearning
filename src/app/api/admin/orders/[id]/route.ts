import { connectDB } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import Order from "@/models/Order";
import Product from "@/models/Product";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const user = await getAuthUser();

    if (!user || !["admin", "super_admin"].includes(user.role)) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { status } = body;

    const order = await Order.findById(params.id);
    if (!order) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }

    if (user.role === "admin" && String(order.institutionId) !== String(user.institutionId)) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const oldStatus = order.status;
    order.status = status || order.status;
    await order.save();

    // If cancelling a product order, restore stock
    if (order.type === "product" && status === "cancelled" && oldStatus !== "cancelled") {
      await Product.findByIdAndUpdate(order.productId, {
        $inc: { stock: order.quantity },
      });
    }

    return Response.json(order);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to update order" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const user = await getAuthUser();

    if (!user || !["admin", "super_admin"].includes(user.role)) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const order = await Order.findById(params.id);
    if (!order) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }

    if (user.role === "admin" && String(order.institutionId) !== String(user.institutionId)) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    // Restore stock if product order
    if (order.type === "product") {
      await Product.findByIdAndUpdate(order.productId, {
        $inc: { stock: order.quantity },
      });
    }

    await Order.findByIdAndDelete(params.id);

    return Response.json({ success: true });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to delete order" }, { status: 500 });
  }
}
