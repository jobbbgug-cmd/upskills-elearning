import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import User from "@/models/User";

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
    role: { type: String, enum: ["student", "teacher"], default: "student" },
    contactChannel: String,
    contactId: String,
    status: { type: String, default: "pending" },
    createdAt: { type: Date, default: Date.now },
  });

  OnlineRegistrationModel = db.model("OnlineRegistration", schema);
}

export async function PATCH(
  request: NextRequest,
  { params }: any
) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    await initializeModel();

    const body = await request.json();
    const { status, username, password } = body;

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

    // If approving, create user with appropriate online role
    if (status === "approved" && username && password) {
      try {
        const userRole = updated.role === "teacher" ? "teacher-online" : "student-online";
        console.log("Creating user with:", { name: updated.name, email: updated.email, username, role: userRole });

        const existingUser = await User.findOne({ email: updated.email });
        if (existingUser) {
          console.log("User already exists:", existingUser.email);
          return NextResponse.json({ ...updated.toObject(), userMessage: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
          name: updated.name,
          email: updated.email,
          username,
          password: hashedPassword,
          role: userRole,
          status: "approved",
          createdAt: new Date(),
        });
        console.log("User created successfully:", newUser._id, newUser.email);
        return NextResponse.json({ ...updated.toObject(), userCreated: true, userId: newUser._id });
      } catch (userError) {
        console.error("Error creating user:", userError);
        return NextResponse.json(
          { error: "Failed to create user: " + (userError instanceof Error ? userError.message : String(userError)) },
          { status: 500 }
        );
      }
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
  request: NextRequest,
  { params }: any
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
