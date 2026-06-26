import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICoupon extends Document {
  institutionId: mongoose.Types.ObjectId;
  code:          string;
  type:          "percent" | "fixed";
  value:         number;
  maxUses:       number | null;
  usedCount:     number;
  expiresAt:     Date | null;
  isActive:      boolean;
  courseIds:     mongoose.Types.ObjectId[];
  createdAt:     Date;
}

const CouponSchema = new Schema<ICoupon>({
  institutionId: { type: Schema.Types.ObjectId, ref: "Institution", required: true },
  code:          { type: String, required: true },
  type:          { type: String, enum: ["percent", "fixed"], required: true },
  value:         { type: Number, required: true },
  maxUses:       { type: Number, default: null },
  usedCount:     { type: Number, default: 0 },
  expiresAt:     { type: Date,   default: null },
  isActive:      { type: Boolean, default: true },
  courseIds:     [{ type: Schema.Types.ObjectId, ref: "Course" }],
}, { timestamps: true });

CouponSchema.index({ institutionId: 1, code: 1 }, { unique: true });

const Coupon: Model<ICoupon> = mongoose.models.Coupon ?? mongoose.model<ICoupon>("Coupon", CouponSchema);
export default Coupon;
