import mongoose, { Schema, Document } from "mongoose";

export interface IUserDocument extends Document {
  name: string;
  email: string;
  password: string;
  role: "student" | "teacher" | "admin";
  status: "pending" | "approved" | "rejected";
  gradeLevel?: string;
  contactChannel?: string;
  contactId?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, default: "" },
    role: { type: String, enum: ["student", "teacher", "admin"], default: "student" },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    gradeLevel: { type: String },
    contactChannel: { type: String, default: "" },
    contactId: { type: String, default: "" },
  },
  { timestamps: true }
);

delete mongoose.models["User"];
export default mongoose.model<IUserDocument>("User", UserSchema);
