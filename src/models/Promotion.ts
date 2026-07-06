import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPromotion extends Document {
  institutionId?: mongoose.Types.ObjectId;
  title: string;
  description: string;
  type: "percent" | "fixed";
  value: number;
  maxUses: number | null;
  usedCount: number;
  startDate: Date;
  endDate: Date | null;
  isActive: boolean;
  courseIds?: mongoose.Types.ObjectId[];
  image?: string;
  createdAt: Date;
}

const PromotionSchema = new Schema<IPromotion>(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: "Institution", default: null },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    type: { type: String, enum: ["percent", "fixed"], required: true },
    value: { type: Number, required: true },
    maxUses: { type: Number, default: null },
    usedCount: { type: Number, default: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
    courseIds: [{ type: Schema.Types.ObjectId, ref: "Course" }],
    image: { type: String, default: "" },
  },
  { timestamps: true }
);

PromotionSchema.index({ institutionId: 1 });

const Promotion: Model<IPromotion> = mongoose.models.Promotion ?? mongoose.model<IPromotion>("Promotion", PromotionSchema);
export default Promotion;
