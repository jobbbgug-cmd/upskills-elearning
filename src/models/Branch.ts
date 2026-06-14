import mongoose, { Schema, Document } from "mongoose";

export interface IBranchDocument extends Document {
  institutionId: mongoose.Types.ObjectId;
  name: string;
  address: string;
  isActive: boolean;
  createdAt: Date;
}

const BranchSchema = new Schema<IBranchDocument>(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: "Institution", required: true },
    name: { type: String, required: true, trim: true },
    address: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Branch ||
  mongoose.model<IBranchDocument>("Branch", BranchSchema);
