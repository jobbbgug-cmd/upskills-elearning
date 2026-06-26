import mongoose, { Schema, Document } from "mongoose";

export interface IHomeworkAttachment {
  name: string;
  url: string;
}

export interface IHomeworkDocument extends Document {
  institutionId?: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  title: string;
  description: string;
  dueDate: Date;
  maxScore: number;
  attachments: IHomeworkAttachment[];
  isActive: boolean;
  createdAt: Date;
}

export interface IHomeworkSubmissionDocument extends Document {
  homeworkId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  content: string;
  attachments: IHomeworkAttachment[];
  score?: number;
  feedback?: string;
  status: "submitted" | "graded";
  submittedAt: Date;
  gradedAt?: Date;
  gradedBy?: mongoose.Types.ObjectId;
}

const AttachmentSchema = new Schema<IHomeworkAttachment>(
  { name: { type: String, required: true }, url: { type: String, required: true } },
  { _id: false }
);

const HomeworkSchema = new Schema<IHomeworkDocument>(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: "Institution", default: null },
    courseId:      { type: Schema.Types.ObjectId, ref: "Course",      required: true },
    createdBy:     { type: Schema.Types.ObjectId, ref: "User",        required: true },
    title:         { type: String, required: true, trim: true },
    description:   { type: String, default: "" },
    dueDate:       { type: Date,   required: true },
    maxScore:      { type: Number, default: 100 },
    attachments:   [AttachmentSchema],
    isActive:      { type: Boolean, default: true },
  },
  { timestamps: true }
);

const HomeworkSubmissionSchema = new Schema<IHomeworkSubmissionDocument>(
  {
    homeworkId:  { type: Schema.Types.ObjectId, ref: "Homework",   required: true },
    studentId:   { type: Schema.Types.ObjectId, ref: "User",       required: true },
    courseId:    { type: Schema.Types.ObjectId, ref: "Course",     required: true },
    content:     { type: String, default: "" },
    attachments: [AttachmentSchema],
    score:       { type: Number },
    feedback:    { type: String },
    status:      { type: String, enum: ["submitted", "graded"], default: "submitted" },
    submittedAt: { type: Date, default: Date.now },
    gradedAt:    { type: Date },
    gradedBy:    { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

HomeworkSubmissionSchema.index({ homeworkId: 1, studentId: 1 }, { unique: true });

export const Homework = mongoose.models.Homework ||
  mongoose.model<IHomeworkDocument>("Homework", HomeworkSchema);

export const HomeworkSubmission = mongoose.models.HomeworkSubmission ||
  mongoose.model<IHomeworkSubmissionDocument>("HomeworkSubmission", HomeworkSubmissionSchema);
