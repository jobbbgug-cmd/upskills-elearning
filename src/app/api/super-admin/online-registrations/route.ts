import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";

// MongoDB model for online registrations
interface OnlineRegistration {
  _id?: string;
  name: string;
  email: string;
  contactChannel: string;
  contactId: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
}

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

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    await initializeModel();

    const registrations = await OnlineRegistrationModel.find({})
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(registrations);
  } catch (error) {
    console.error("Error fetching online registrations:", error);
    return NextResponse.json(
      { error: "Failed to fetch registrations" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    await initializeModel();

    const body = await req.json();
    const { name, email, contactChannel, contactId } = body;

    if (!name || !email || !contactChannel || !contactId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const registration = await OnlineRegistrationModel.create({
      name,
      email,
      contactChannel,
      contactId,
      status: "pending",
      createdAt: new Date(),
    });

    return NextResponse.json(registration, { status: 201 });
  } catch (error) {
    console.error("Error creating online registration:", error);
    return NextResponse.json(
      { error: "Failed to create registration" },
      { status: 500 }
    );
  }
}
