import mongoose, { Schema, Document } from "mongoose";

export interface ICategoryDocument extends Document {
  institutionId?: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  type: "online" | "onsite" | "live online";
  isActive: boolean;
  order: number;
  createdAt: Date;
}

const CategorySchema = new Schema<ICategoryDocument>(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: "Institution", default: null },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    type: { type: String, enum: ["online", "onsite", "live online"], required: true, default: "online" },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Composite unique index: allow same name but different types
CategorySchema.index({ name: 1, type: 1 }, { unique: true });

export default mongoose.models.Category || mongoose.model<ICategoryDocument>("Category", CategorySchema);
