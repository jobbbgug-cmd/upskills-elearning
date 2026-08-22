import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  courseId?: mongoose.Types.ObjectId;
  learningPathId?: mongoose.Types.ObjectId;
  type: "course" | "learning-path";
  paymentMethod: "promptpay" | "bank-transfer" | "credit-card";
  slipUrl?: string;
  status: "pending" | "approved" | "rejected";
  orderDate: Date;
  approvedDate?: Date;
  rejectionReason?: string;
}

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course" },
    learningPathId: { type: Schema.Types.ObjectId, ref: "LearningPath" },
    type: { type: String, enum: ["course", "learning-path"], required: true },
    paymentMethod: {
      type: String,
      enum: ["promptpay", "bank-transfer", "credit-card"],
      required: true,
    },
    slipUrl: String,
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    orderDate: { type: Date, default: Date.now },
    approvedDate: Date,
    rejectionReason: String,
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
