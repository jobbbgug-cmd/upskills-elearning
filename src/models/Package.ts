import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPackage extends Document {
  institutionId?: mongoose.Types.ObjectId;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  maxUses: number | null;
  usedCount: number;
  courseIds: mongoose.Types.ObjectId[];
  duration?: number; // in days
  features?: string[];
  isActive: boolean;
  expiresAt?: Date | null;
  image?: string;
  createdAt: Date;
}

const PackageSchema = new Schema<IPackage>(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: "Institution", default: null },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true },
    originalPrice: { type: Number, default: null },
    maxUses: { type: Number, default: null },
    usedCount: { type: Number, default: 0 },
    courseIds: [{ type: Schema.Types.ObjectId, ref: "Course" }],
    duration: { type: Number, default: null },
    features: [{ type: String }],
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date, default: null },
    image: { type: String, default: "" },
  },
  { timestamps: true }
);

PackageSchema.index({ institutionId: 1 });

const Package: Model<IPackage> = mongoose.models.Package ?? mongoose.model<IPackage>("Package", PackageSchema);
export default Package;
