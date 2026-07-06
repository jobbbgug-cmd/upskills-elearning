import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  institutionId?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: "course" | "product";

  // Course order fields
  courseId?: mongoose.Types.ObjectId;
  sessionId?: mongoose.Types.ObjectId;

  // Product order fields
  productId?: mongoose.Types.ObjectId;
  quantity: number;

  // Common fields
  amount: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  paymentMethod?: string;
  paymentProof?: string;
  notes?: string;

  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: "Institution", default: null },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["course", "product"], required: true },

    courseId: { type: Schema.Types.ObjectId, ref: "Course", default: null },
    sessionId: { type: Schema.Types.ObjectId, default: null },

    productId: { type: Schema.Types.ObjectId, ref: "Product", default: null },
    quantity: { type: Number, default: 1, min: 1 },

    amount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["pending", "confirmed", "cancelled", "completed"], default: "pending" },
    paymentMethod: { type: String, default: "" },
    paymentProof: { type: String, default: "" },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

// Index for filtering
OrderSchema.index({ userId: 1, status: 1 });
OrderSchema.index({ institutionId: 1, status: 1 });
OrderSchema.index({ type: 1, status: 1 });

export default mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
