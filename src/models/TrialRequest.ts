import mongoose, { Schema } from "mongoose";

export interface ITrialRequest {
  institutionName: string;
  fullName: string;
  phone: string;
  institutionType: string;
  contactChannel: string; // "line" | "email" | "phone"
  contactValue: string;
  status: "pending" | "contacted" | "approved" | "rejected";
  createdAt: Date;
}

const TrialRequestSchema = new Schema<ITrialRequest>({
  institutionName: { type: String, required: true },
  fullName:        { type: String, required: true },
  phone:           { type: String, required: true },
  institutionType: { type: String, required: true },
  contactChannel:  { type: String, required: true },
  contactValue:    { type: String, required: true },
  status:          { type: String, enum: ["pending", "contacted", "approved", "rejected"], default: "pending" },
}, { timestamps: true });

export default mongoose.models.TrialRequest ?? mongoose.model<ITrialRequest>("TrialRequest", TrialRequestSchema);
