import mongoose, { Schema, Document } from "mongoose";

export interface IInstitutionDocument extends Document {
  slug: string;
  name: string;
  logoUrl: string;
  faviconUrl: string;
  primaryColor: string;
  tagline: string;
  whiteLabelMode: boolean;
  customDomain: string;
  plan: "trial" | "starter" | "pro" | "enterprise";
  planExpiresAt: Date | null;
  isActive: boolean;
  commissionRate: number;
  parentId: mongoose.Types.ObjectId | null;
  createdAt: Date;
}

const InstitutionSchema = new Schema<IInstitutionDocument>(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    logoUrl: { type: String, default: "" },
    faviconUrl: { type: String, default: "" },
    primaryColor: { type: String, default: "#7c3aed" },
    tagline: { type: String, default: "" },
    whiteLabelMode: { type: Boolean, default: false },
    customDomain: { type: String, default: "" },
    plan: { type: String, enum: ["trial", "starter", "pro", "enterprise"], default: "trial" },
    planExpiresAt: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
    commissionRate: { type: Number, default: 0 },
    parentId: { type: Schema.Types.ObjectId, ref: "Institution", default: null },
  },
  { timestamps: true }
);

export default mongoose.models.Institution ||
  mongoose.model<IInstitutionDocument>("Institution", InstitutionSchema);
