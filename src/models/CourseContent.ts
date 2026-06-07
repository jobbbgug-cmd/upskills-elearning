import mongoose, { Schema, Document } from "mongoose";

export interface ICourseContentDocument extends Document {
  name: string;
  description: string;
  ebookCoverUrl: string;
  ebookPdfUrl: string;
  smartPpts: { title: string; thumbnailUrl: string; pptUrl: string }[];
  teachingClips: { title: string; youtubeUrl: string }[];
  summaryClips: { title: string; youtubeUrl: string }[];
  downloadFree: { title: string; thumbnailUrl: string; fileUrl: string }[];
  downloadTeacherCard: { title: string; thumbnailUrl: string; fileUrl: string }[];
  downloadAksorn: { title: string; thumbnailUrl: string; fileUrl: string }[];
  createdAt: Date;
}

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

const CourseContentSchema = new Schema<ICourseContentDocument>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    ebookCoverUrl: { type: String, default: "" },
    ebookPdfUrl: { type: String, default: "" },
    smartPpts: [SmartPptSchema],
    teachingClips: [YoutubeClipSchema],
    summaryClips: [YoutubeClipSchema],
    downloadFree: [DownloadItemSchema],
    downloadTeacherCard: [DownloadItemSchema],
    downloadAksorn: [DownloadItemSchema],
  },
  { timestamps: true }
);

export default mongoose.models.CourseContent ||
  mongoose.model<ICourseContentDocument>("CourseContent", CourseContentSchema);
