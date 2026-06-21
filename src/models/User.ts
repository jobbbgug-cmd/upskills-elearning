import mongoose, { Schema, Document } from "mongoose";

export interface IUserDocument extends Document {
  institutionId?: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: "student" | "teacher" | "admin" | "owner" | "super_admin";
  status: "pending" | "approved" | "rejected";
  gradeLevel?: string;
  profileImage?: string;
  teacherId?: string;
  teacherName?: string;
  contactChannel?: string;
  contactId?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: "Institution", default: null },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, default: "" },
    role: { type: String, enum: ["student", "teacher", "admin", "owner", "super_admin"], default: "student" },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    gradeLevel: { type: String },
    profileImage: { type: String, default: "" },
    teacherId: { type: String, default: "" },
    teacherName: { type: String, default: "" },
    contactChannel: { type: String, default: "" },
    contactId: { type: String, default: "" },
  },
  { timestamps: true }
);

delete mongoose.models["User"];
export default mongoose.model<IUserDocument>("User", UserSchema);
