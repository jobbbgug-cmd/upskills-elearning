import mongoose, { Schema, Document } from "mongoose";

export interface ICertificate extends Document {
  institutionId?: mongoose.Types.ObjectId;
  studentId:      mongoose.Types.ObjectId;
  courseId?:      mongoose.Types.ObjectId;
  title:          string;
  description?:   string;
  issuedBy:       mongoose.Types.ObjectId;
  issuedAt:       Date;
  code:           string;
}

const CertificateSchema = new Schema<ICertificate>(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: "Institution", default: null },
    studentId:     { type: Schema.Types.ObjectId, ref: "User",        required: true },
    courseId:      { type: Schema.Types.ObjectId, ref: "Course",      default: null },
    title:         { type: String, required: true, trim: true },
    description:   { type: String, default: "" },
    issuedBy:      { type: Schema.Types.ObjectId, ref: "User",        required: true },
    issuedAt:      { type: Date, default: Date.now },
    code:          { type: String, unique: true },
  },
  { timestamps: true }
);

CertificateSchema.pre("save", function (next) {
  if (!this.code) {
    this.code = `CERT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  }
  next();
});

const Certificate = mongoose.models.Certificate ||
  mongoose.model<ICertificate>("Certificate", CertificateSchema);

export default Certificate;
