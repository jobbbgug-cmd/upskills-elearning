import mongoose, { Schema, Document } from "mongoose";

export interface IBookingDocument extends Document {
  institutionId?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  sessionId: mongoose.Types.ObjectId;
  seatNumber: number;
  status: "pending_payment" | "confirmed" | "cancelled" | "rejected";
  slipImage: string;
  expiresAt: Date | null;
  commissionAmount: number;
  createdAt: Date;
}

const BookingSchema = new Schema<IBookingDocument>(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: "Institution", default: null },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    sessionId: { type: Schema.Types.ObjectId, required: true },
    seatNumber: { type: Number, required: true },
    status: { type: String, enum: ["pending_payment", "confirmed", "cancelled", "rejected"], default: "pending_payment" },
    slipImage:       { type: String, default: "" },
    expiresAt:  { type: Date, default: null },
  commissionAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// One booking per user per session
BookingSchema.index({ userId: 1, courseId: 1, sessionId: 1 }, { unique: true });

export default mongoose.models.Booking || mongoose.model<IBookingDocument>("Booking", BookingSchema);
