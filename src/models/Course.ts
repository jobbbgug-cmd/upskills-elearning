import mongoose, { Schema, Document } from "mongoose";

export interface ISessionDocument {
  _id: mongoose.Types.ObjectId;
  date: Date;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  bookedCount: number;
  bookedSeats: number[];
  zoomLink?: string;
}

export interface ICourseDocument extends Document {
  title: string;
  description: string;
  coverImage: string;
  gradeLevels: string[];
  instructor: string;
  category: string;
  sessions: ISessionDocument[];
  price: number;
  isActive: boolean;
  qrCodeImage: string;
  bankAccount: string;
  bankName: string;
  createdAt: Date;
}

const SessionSchema = new Schema<ISessionDocument>({
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  maxCapacity: { type: Number, required: true, default: 10 },
  bookedCount: { type: Number, default: 0 },
  bookedSeats: [{ type: Number }],
  zoomLink: { type: String },
});

const CourseSchema = new Schema<ICourseDocument>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    coverImage: { type: String, default: "" },
    gradeLevels: [{ type: String }],
    instructor: { type: String, required: true },
    category: { type: String, required: true },
    sessions: [SessionSchema],
    price: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    qrCodeImage: { type: String, default: "" },
    bankAccount: { type: String, default: "" },
    bankName: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.Course || mongoose.model<ICourseDocument>("Course", CourseSchema);
