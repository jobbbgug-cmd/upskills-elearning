import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  institutionId?: mongoose.Types.ObjectId;
  name: string;
  description: string;
  price: number;
  stock: number;
  isActive: boolean;
  image?: string;
  sku?: string;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: "Institution", default: null },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, default: 0 },
    isActive: { type: Boolean, default: true },
    image: { type: String, default: "" },
    sku: { type: String, default: "" },
    category: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
