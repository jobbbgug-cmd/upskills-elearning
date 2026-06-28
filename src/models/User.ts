import mongoose, { Schema, Document } from "mongoose";

export interface IStudentDocument {
  _id: mongoose.Types.ObjectId;
  name: string;
  url: string;
  type: string;
  uploadedAt: Date;
}

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
  // student extended profile
  nickname?: string;
  phone?: string;
  birthDate?: Date;
  address?: string;
  houseNumber?: string;
  building?: string;
  subDistrict?: string;
  amphoe?: string;
  province?: string;
  parentName?: string;
  parentPhone?: string;
  parentRelation?: string;
  groups?: string[];
  documents?: IStudentDocument[];
  notes?: string;
  createdAt: Date;
}

const StudentDocumentSchema = new Schema<IStudentDocument>(
  {
    name:       { type: String, required: true },
    url:        { type: String, required: true },
    type:       { type: String, default: "other" },
    uploadedAt: { type: Date,   default: Date.now },
  },
  { _id: true }
);

const UserSchema = new Schema<IUserDocument>(
  {
    institutionId:  { type: Schema.Types.ObjectId, ref: "Institution", default: null },
    name:           { type: String, required: true, trim: true },
    email:          { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:       { type: String, default: "" },
    role:           { type: String, enum: ["student", "teacher", "admin", "owner", "super_admin"], default: "student" },
    status:         { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    gradeLevel:     { type: String },
    profileImage:   { type: String, default: "" },
    teacherId:      { type: String, default: "" },
    teacherName:    { type: String, default: "" },
    contactChannel: { type: String, default: "" },
    contactId:      { type: String, default: "" },
    // student extended profile
    nickname:       { type: String, default: "" },
    phone:          { type: String, default: "" },
    birthDate:      { type: Date,   default: null },
    address:        { type: String, default: "" },
    houseNumber:    { type: String, default: "" },
    building:       { type: String, default: "" },
    subDistrict:    { type: String, default: "" },
    amphoe:         { type: String, default: "" },
    province:       { type: String, default: "" },
    parentName:     { type: String, default: "" },
    parentPhone:    { type: String, default: "" },
    parentRelation: { type: String, default: "" },
    groups:         [{ type: String }],
    documents:      [StudentDocumentSchema],
    notes:          { type: String, default: "" },
  },
  { timestamps: true }
);

UserSchema.index({ institutionId: 1, status: 1 });
UserSchema.index({ institutionId: 1, role: 1 });
UserSchema.index({ institutionId: 1 });

export default mongoose.models.User as mongoose.Model<IUserDocument> ||
  mongoose.model<IUserDocument>("User", UserSchema);
