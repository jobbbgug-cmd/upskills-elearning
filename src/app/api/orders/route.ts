import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { put } from "@vercel/blob";
import Order from "@/models/Order";

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const contentType = req.headers.get("content-type") || "";
    let orderData: any = {};
    let slipUrl: string = "";

    if (contentType.includes("application/json")) {
      // JSON request (for credit card, etc.)
      orderData = await req.json();
    } else if (contentType.includes("multipart/form-data")) {
      // FormData request (for PromptPay/Bank transfer with file)
      const formData = await req.formData();
      orderData = {
        courseId: formData.get("courseId"),
        learningPathId: formData.get("learningPathId"),
        paymentMethod: formData.get("paymentMethod"),
        type: formData.get("type"),
      };

      // Handle file upload
      const slip = formData.get("slip") as File;
      if (slip) {
        try {
          const ext = slip.name.split(".").pop() ?? "jpg";
          const filename = `slips/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

          if (process.env.NODE_ENV === "development" || !process.env.BLOB_READ_WRITE_TOKEN) {
            const buffer = await slip.arrayBuffer();
            const base64 = Buffer.from(buffer).toString("base64");
            slipUrl = `data:${slip.type};base64,${base64}`;
          } else {
            const blob = await put(filename, slip, { access: "public" });
            slipUrl = blob.url;
          }
        } catch (error) {
          console.error("Slip upload error:", error);
        }
      }
    }

    // Save order to database
    const order = await Order.create({
      userId: auth.userId,
      courseId: orderData.courseId || undefined,
      learningPathId: orderData.learningPathId || undefined,
      type: orderData.type || "course",
      paymentMethod: orderData.paymentMethod,
      slipUrl,
      status: "pending",
    });

    console.log("Order created:", order._id);

    return NextResponse.json({ orderId: order._id.toString() }, { status: 201 });
  } catch (err: unknown) {
    console.error("Order creation error:", err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
