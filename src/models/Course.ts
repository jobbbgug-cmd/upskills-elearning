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
  instructorId: string;
  category: string;
  sessions: ISessionDocument[];
  price: number;
  isActive: boolean;
  qrCodeImage: string;
  bankAccount: string;
  bankName: string;
  linkDigital?: string;
  linkClip?: string;
  linkSupplementary?: string;
  linkFullbook?: string;
  linkDownload?: string;
  ebookPdfUrl?: string;
  contentId?: mongoose.Types.ObjectId;
  smartPpts?: { title: string; thumbnailUrl: string; pptUrl: string }[];
  teachingClips?: { title: string; youtubeUrl: string }[];
  summaryClips?: { title: string; youtubeUrl: string }[];
  downloadFree?: { title: string; thumbnailUrl: string; fileUrl: string }[];
  downloadTeacherCard?: { title: string; thumbnailUrl: string; fileUrl: string }[];
  downloadAksorn?: { title: string; thumbnailUrl: string; fileUrl: string }[];
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

const YoutubeClipSchema = new Schema(
  { title: { type: String, default: "" }, youtubeUrl: { type: String, default: "" } },
  { _id: false }
);

const SmartPptSchema = new Schema(
  { title: { type: String, default: "" }, thumbnailUrl: { type: String, default: "" }, pptUrl: { type: String, default: "" } },
  { _id: false }
);

const DownloadItemSchema = new Schema(
  { title: { type: String, default: "" }, thumbnailUrl: { type: String, default: "" }, fileUrl: { type: String, default: "" } },
  { _id: false }
);

const CourseSchema = new Schema<ICourseDocument>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    coverImage: { type: String, default: "" },
    gradeLevels: [{ type: String }],
    instructor: { type: String, required: true },
    instructorId: { type: String, default: "" },
    category: { type: String, required: true },
    sessions: [SessionSchema],
    price: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    qrCodeImage: { type: String, default: "" },
    bankAccount: { type: String, default: "" },
    bankName: { type: String, default: "" },
    linkDigital: { type: String, default: "" },
    linkClip: { type: String, default: "" },
    linkSupplementary: { type: String, default: "" },
    linkFullbook: { type: String, default: "" },
    linkDownload: { type: String, default: "" },
    ebookPdfUrl: { type: String, default: "" },
    contentId: { type: Schema.Types.ObjectId, ref: "CourseContent", default: null },
    smartPpts: [SmartPptSchema],
    teachingClips: [YoutubeClipSchema],
    summaryClips: [YoutubeClipSchema],
    downloadFree: [DownloadItemSchema],
    downloadTeacherCard: [DownloadItemSchema],
    downloadAksorn: [DownloadItemSchema],
  },
  { timestamps: true }
);

export default mongoose.models.Course || mongoose.model<ICourseDocument>("Course", CourseSchema);
