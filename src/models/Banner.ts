import mongoose, { Schema, Document } from "mongoose";

export interface IBannerDocument extends Document {
  imageUrl: string;
  title: string;
  subtitle: string;
  linkUrl: string;
  linkText: string;
  bgColor: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
}

const BannerSchema = new Schema<IBannerDocument>(
  {
    imageUrl: { type: String, required: true },
    title: { type: String, default: "" },
    subtitle: { type: String, default: "" },
    linkUrl: { type: String, default: "" },
    linkText: { type: String, default: "ดูรายละเอียด" },
    bgColor: { type: String, default: "#1e1b4b" },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Banner || mongoose.model<IBannerDocument>("Banner", BannerSchema);
