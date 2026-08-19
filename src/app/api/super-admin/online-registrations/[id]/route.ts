import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { ObjectId } from "mongodb";

let OnlineRegistrationModel: any;

async function initializeModel() {
  if (OnlineRegistrationModel) return;

  const db = await connectDB();

  if (db.models.OnlineRegistration) {
    OnlineRegistrationModel = db.models.OnlineRegistration;
    return;
  }

  const schema = new (await import("mongoose")).Schema({
    name: String,
    email: String,
    contactChannel: String,
    contactId: String,
    status: { type: String, default: "pending" },
    createdAt: { type: Date, default: Date.now },
  });

  OnlineRegistrationModel = db.model("OnlineRegistration", schema);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    await initializeModel();

    const body = await req.json();
    const { status } = body;

    if (!status || !["pending", "approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    const updated = await OnlineRegistrationModel.findByIdAndUpdate(
      params.id,
      { status },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating registration:", error);
    return NextResponse.json(
      { error: "Failed to update registration" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    await initializeModel();

    const deleted = await OnlineRegistrationModel.findByIdAndDelete(params.id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting registration:", error);
    return NextResponse.json(
      { error: "Failed to delete registration" },
      { status: 500 }
    );
  }
}
